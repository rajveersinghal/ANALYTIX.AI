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
      setError("Prediction failed. Please ensure the model is ready.");
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
             What-If Simulator
             <span className="shimmer" style={{ fontSize: '.6rem', background: 'var(--violet-g)', color: '#b0a0ff', padding: '3px 8px', borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '.05em' }}>Live Engine</span>
          </h3>
          <p style={{ fontSize: '.76rem', color: 'var(--t3)', marginTop: '4px' }}>Adjust variables to simulate real-world outcomes.</p>
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
                <p style={{ fontSize: '.65rem', fontWeight: 800, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '16px' }}>Discrete Factors</p>
                {categoricalFeatures.map((key) => (
                  <div key={key} style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '.7rem', fontWeight: 600, color: 'var(--t2)', display: 'block', marginBottom: '6px', textTransform: 'capitalize' }}>
                       {key.replace(/_/g, ' ')}
                    </label>
                    <select 
                      value={inputs[key]}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      style={{ width: '100%', background: 'var(--bg-4)', border: '1px solid var(--bdr)', color: 'var(--t1)', padding: '8px 12px', borderRadius: '8px', fontSize: '.75rem', outline: 'none' }}
                    >
                       {categoricalOptions[key]?.map(opt => (
                         <option key={opt} value={opt}>{opt}</option>
                       ))}
                    </select>
                  </div>
                ))}
             </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '.65rem', fontWeight: 800, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '16px' }}>Numerical Drivers</p>
            {numericalFeatures.map((key) => {
              const val = inputs[key];
              const config = ranges[key] || { min: 0, max: 100, step: 1 };

              return (
                <div key={key} style={{ marginBottom: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ fontSize: '.7rem', fontWeight: 600, color: 'var(--t2)', textTransform: 'capitalize' }}>
                      {key.replace(/_/g, ' ')}
                    </label>
                    <span className="sim-metric-badge">
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
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Prediction */}
        <div style={{ background: 'rgba(255,255,255,.015)', border: '1px solid var(--bdr)', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', minHeight: '320px', position: 'relative' }}>
           <AnimatePresence>
            {loading && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="animate-pulse" style={{ position: 'absolute', inset: 0, background: 'var(--violet-g)', borderRadius: '24px' }} />}
           </AnimatePresence>

           <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
             <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--violet-g)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '1px solid var(--bdr-s)' }}>
                {loading ? <Zap size={28} className="animate-pulse" style={{ color: 'var(--violet)' }} /> : <Play size={28} style={{ color: 'var(--violet)', marginLeft: '4px' }} />}
             </div>
             
             <h4 style={{ fontSize: '.6rem', fontWeight: 800, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.2em', marginBottom: '12px' }}>Current Prediction</h4>
             
             {prediction ? (
               <motion.div 
                 key={JSON.stringify(prediction) + prediction.lastUpdated}
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
               >
                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--mint)', opacity: 0.9 }}>₹</span>
                        <span style={{ fontSize: '3.5rem', fontWeight: 900, color: '#fff', letterSpacing: '-.02em', lineHeight: 1 }}>
                            {(() => {
                               const val = typeof prediction === 'object' ? prediction.prediction : prediction;
                               const isClassification = typeof val === 'string' || (prediction.probabilities && !isNaN(val));
                               
                               if (isClassification) {
                                  return val;
                               }

                               // Smart Formatting for Regression (e.g. Sales)
                               if (val >= 100) return (val/100).toFixed(2);
                               return val?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 1 }) || '---';
                            })()}
                         </span>
                         <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--mint)', opacity: 0.8 }}>
                            {(() => {
                               const val = typeof prediction === 'object' ? prediction.prediction : prediction;
                               if (typeof val === 'string' || prediction.probabilities) return '';
                               return val >= 100 ? 'Cr' : 'Lakh';
                            })()}
                         </span>
                    </div>
                    <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--mint)', textTransform: 'uppercase', letterSpacing: '.1em', marginTop: '-4px', opacity: 0.7 }}>
                        Neural Forecast (INR)
                    </div>
                 </div>
                 {prediction.confidence && (
                    <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '.7rem', fontWeight: 600, color: 'var(--t2)' }}>
                       <div style={{ width: '60px', height: '4px', background: 'var(--bg-4)', borderRadius: '10px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: 'var(--mint)', width: `${prediction.confidence * 100}%` }} />
                       </div>
                       {(prediction.confidence * 100).toFixed(0)}% Certainty
                    </div>
                 )}
               </motion.div>
             ) : (
               <div className="animate-pulse" style={{ color: 'var(--t3)', fontSize: '.8rem', fontStyle: 'italic' }}>Calculating Intelligence...</div>
             )}

             {error && (
               <p style={{ marginTop: '16px', fontSize: '.68rem', color: 'var(--rose)', fontWeight: 600, maxWidth: '200px' }}>{error}</p>
             )}
           </div>

           <div style={{ marginTop: '40px', padding: '12px', background: 'var(--bg-4)', borderRadius: '12px', border: '1px solid var(--bdr)', display: 'flex', gap: '8px' }}>
              <HelpCircle size={14} style={{ color: 'var(--t3)', flexShrink: 0, marginTop: '2px' }} />
              <p style={{ fontSize: '.68rem', color: 'var(--t3)', lineHeight: 1.4, textAlign: 'left' }}>
                 Interact with variables to see how the model reacts. Real-time simulation is powered by the <strong>active Neural Engine</strong>.
              </p>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
