import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Zap, HelpCircle, AlertCircle } from "lucide-react";
import { apiClient } from "../../api/api";
import { useStore } from "../../store/useStore";

export default function WhatIfSimulator({ initialInputs = {}, categoricalOptions = {} }) {
  const { sessionId } = useStore();
  const [inputs, setInputs] = useState(initialInputs);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Memoize ranges to prevent the "shifting max" problem while sliding
  const ranges = useMemo(() => {
    const r = {};
    Object.keys(initialInputs).forEach(key => {
      const val = initialInputs[key];
      if (typeof val === 'number') {
        // If 0, use 0-100. Otherwise use 0 to 2.5x original value
        r[key] = {
          min: 0,
          max: val === 0 ? 100 : Math.ceil(val * 2.5),
          step: val < 5 && val !== 0 ? 0.1 : 1
        };
      }
    });
    return r;
  }, [initialInputs]);

  const fetchPrediction = useCallback(async (currentInputs) => {
    if (!sessionId) return;
    setLoading(true);
    try {
      setPrediction(null); // Clear stale prediction immediately
      const response = await apiClient.predictSingle(sessionId, currentInputs);
      setPrediction(response); 
      setError(null);
    } catch (err) {
      console.error("Prediction failed:", err);
      setError("We're having trouble simulating the result. Please check if your model is active.");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!initialInputs || Object.keys(initialInputs).length === 0) return;
    
    const timeout = setTimeout(() => {
      if (sessionId) fetchPrediction(inputs);
    }, 300); 

    return () => clearTimeout(timeout);
  }, [inputs, fetchPrediction, sessionId, initialInputs]);

  const handleInputChange = (key, value) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const allFeatures = Object.keys(inputs);
  const numericalFeatures = allFeatures.filter(key => typeof inputs[key] === 'number');
  const categoricalFeatures = allFeatures.filter(key => typeof inputs[key] !== 'number');

  if (!initialInputs || Object.keys(initialInputs).length === 0) {
    return (
      <div className="glass-panel text-center py-10">
        <HelpCircle size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
        <div style={{ color: 'var(--t2)', fontSize: '.9rem' }}>No features detected for simulation.</div>
      </div>
    );
  }

  // Helper to convert number to Indian words
  const numberToIndianWords = (num) => {
    if (num === null || isNaN(num) || num === undefined) return "Zero Only";
    
    const singleDigits = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const teenDigits = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const doubleDigits = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    
    const getWords = (n) => {
        if (n === 0) return "";
        let str = "";
        if (n >= 100) {
            str += singleDigits[Math.floor(n / 100)] + " Hundred ";
            n %= 100;
        }
        if (n >= 20) {
            str += doubleDigits[Math.floor(n / 10)] + " ";
            n %= 10;
            if (n > 0) str += singleDigits[n] + " ";
        } else if (n >= 10) {
            str += teenDigits[n - 10] + " ";
        } else if (n > 0) {
            str += singleDigits[n] + " ";
        }
        return str.trim();
    };

    let result = "";
    let n = Math.floor(num);
    // If input is purely a prediction result, it might be in Lakhs already depending on model. 
    // We assume the input 'num' is the base value (e.g. 183.21)
    // If it's a small number like 183.21, we treat it as the literal value for words
    
    if (n >= 10000000) {
        result += getWords(Math.floor(n / 10000000)) + " Crore ";
        n %= 10000000;
    }
    if (n >= 100000) {
        result += getWords(Math.floor(n / 100000)) + " Lakh ";
        n %= 100000;
    }
    if (n >= 1000) {
        result += getWords(Math.floor(n / 1000)) + " Thousand ";
        n %= 1000;
    }
    if (n > 0) {
        result += getWords(n);
    }
    
    if (result.trim() === "") result = getWords(n) || "Zero";

    return result.trim() + " Only";
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel"
      style={{ position: 'relative' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
             Smart Simulator
             <span className="shimmer" style={{ fontSize: '.6rem', background: 'var(--violet-g)', color: '#b0a0ff', padding: '3px 8px', borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '.05em' }}>AI Live</span>
          </h3>
          <p style={{ fontSize: '.76rem', color: 'var(--t3)', marginTop: '4px' }}>Change these values to see how they might affect your results.</p>
        </div>
      </div>

      {!sessionId && (
        <div style={{ marginBottom: '20px', padding: '12px', borderRadius: '10px', background: 'rgba(244,63,94,.05)', border: '1px solid rgba(244,63,94,.15)', color: 'var(--rose)', fontSize: '.72rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
           <AlertCircle size={14} />
           <span>Warning: No active session. Predictions will be disabled.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div style={{ maxHeight: '420px', overflowY: 'auto', paddingRight: '10px' }}>
          
          {categoricalFeatures.length > 0 && (
             <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '.65rem', fontWeight: 800, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '16px' }}>Category Settings</p>
                {categoricalFeatures.map((key) => (
                  <div key={key} style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '.7rem', fontWeight: 600, color: 'var(--t2)', display: 'block', marginBottom: '6px', textTransform: 'capitalize' }}>
                       {key.replace(/_/g, ' ')}
                    </label>
                    <select 
                      value={inputs[key]}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      style={{ width: '100%', background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px 16px', borderRadius: '14px', fontSize: '.85rem', outline: 'none' }}
                    >
                       {categoricalOptions[key]?.map(opt => (
                         <option key={opt} value={opt} style={{ background: '#0a0c1e' }}>{opt}</option>
                       ))}
                    </select>
                  </div>
                ))}
             </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '.65rem', fontWeight: 800, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '16px' }}>Key Numbers</p>
            {numericalFeatures.map((key) => {
              const val = inputs[key];
              const config = ranges[key] || { min: 0, max: 100, step: 1 };

              return (
                <div key={key} style={{ marginBottom: '22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--t2)', textTransform: 'capitalize' }}>
                      {key.replace(/_/g, ' ')}
                    </label>
                    <span className="sim-metric-badge" style={{ background: 'var(--violet-dim)', color: 'var(--violet)', fontWeight: 800 }}>
                       {typeof val === 'number' ? val.toLocaleString(undefined, { maximumFractionDigits: 2 }) : val}
                    </span>
                  </div>
                  <input
                    type="range"
                    className="sim-slider"
                    min={config.min}
                    max={config.max}
                    step={config.step}
                    value={val}
                    onChange={(e) => handleInputChange(key, parseFloat(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Prediction Display */}
        <div style={{ background: 'rgba(255,255,255,.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', minHeight: '380px', position: 'relative' }}>
           <AnimatePresence>
            {loading && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="animate-pulse" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(139,92,246,0.05) 100%)', borderRadius: '32px', zIndex: 0 }} />}
           </AnimatePresence>

           <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, width: '100%' }}>
             <div style={{ width: '70px', height: '70px', borderRadius: '24px', background: 'var(--violet-g)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1px solid rgba(255,255,255,0.1)', transform: 'rotate(5deg)' }}>
                {loading ? <Zap size={32} className="animate-spin" style={{ color: 'var(--violet)' }} /> : <Play size={32} style={{ color: 'var(--violet)', marginLeft: '4px' }} />}
             </div>
             
             <h4 style={{ fontSize: '.7rem', fontWeight: 900, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.3em', marginBottom: '16px' }}>Simulation Result</h4>
             
             {prediction ? (
               <motion.div 
                 key={JSON.stringify(prediction)}
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
               >
                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                        <span style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--mint)', opacity: 0.6 }}>₹</span>
                        <span style={{ fontSize: '4.5rem', fontWeight: 950, color: '#fff', letterSpacing: '-.03em', lineHeight: 1, textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                            {(() => {
                               const val = typeof prediction === 'object' ? prediction.prediction : prediction;
                               const isClassification = typeof val === 'string' || (prediction.probabilities && !isNaN(val));
                               
                               if (isClassification) return val;

                               // Smart Scaling
                               if (val > 0 && val < 500) {
                                  return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                                }

                               if (val >= 10000000) return (val/10000000).toFixed(2);
                               if (val >= 100000) return (val/100000).toFixed(2);
                               return val?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '---';
                            })()}
                         </span>
                         <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--mint)', opacity: 0.8, textTransform: 'uppercase' }}>
                            {(() => {
                               const val = typeof prediction === 'object' ? prediction.prediction : prediction;
                               if (typeof val === 'string' || prediction.probabilities) return '';
                               if (val >= 10000000) return ' Cr';
                               if (val >= 100000) return ' Lk';
                               if (val > 0 && val < 500) return ' Lk';
                               return '';
                            })()}
                         </span>
                    </div>
                    
                    {/* English Word Representation (Indian System) */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.7 }}
                        style={{ fontSize: '.85rem', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '.05em', marginTop: '12px', padding: '8px 24px', background: 'rgba(255,255,255,0.03)', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                        {(() => {
                            const val = typeof prediction === 'object' ? prediction.prediction : prediction;
                            let absVal = val;
                            if (val > 0 && val < 500) absVal = val * 100000;
                            return numberToIndianWords(absVal);
                        })()}
                    </motion.div>

                    <div style={{ fontSize: '.7rem', fontWeight: 800, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.2em', marginTop: '20px' }}>
                        AI Prediction Result
                    </div>
                 </div>
                 
                 {prediction.confidence && (
                    <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '.75rem', fontWeight: 700, color: 'var(--t2)' }}>
                       <div style={{ width: '100px', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                          <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--mint), #4ade80)', width: `${prediction.confidence * 100}%` }} />
                       </div>
                       {(prediction.confidence * 100).toFixed(0)}% Accuracy
                    </div>
                 )}
               </motion.div>
             ) : (
               <div className="flex flex-col items-center gap-4">
                  <div className="animate-pulse w-32 h-10 bg-white/5 rounded-2xl" />
                  <div style={{ color: 'var(--t3)', fontSize: '.85rem', fontWeight: 600, fontStyle: 'italic' }}>Simulating Outcomes...</div>
               </div>
             )}

             {error && (
               <p style={{ marginTop: '20px', padding: '10px 20px', background: 'rgba(244,63,94,0.1)', borderRadius: '12px', fontSize: '.75rem', color: 'var(--rose)', fontWeight: 700, display: 'inline-block' }}>{error}</p>
             )}
           </div>

           <div style={{ marginTop: '40px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '12px' }}>
              <Zap size={18} style={{ color: 'var(--violet)', flexShrink: 0, marginTop: '2px' }} />
              <p style={{ fontSize: '.72rem', color: 'var(--t3)', lineHeight: 1.5, textAlign: 'left', fontWeight: 500 }}>
                 Predictions are made by our <strong>best AI model</strong>. These results are based on strong patterns found in your data.
              </p>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
