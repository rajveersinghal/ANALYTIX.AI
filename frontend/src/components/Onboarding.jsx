import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Sparkles, 
  Database, 
  Cpu, 
  BarChart3, 
  MessageSquare,
  Rocket
} from 'lucide-react';

const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to AnalytixAI',
    description: 'The next generation of autonomous sales and data intelligence. Let\'s take a quick tour of your new command center.',
    icon: Rocket,
    color: '#7C3AED'
  },
  {
    id: 'pipeline',
    title: 'Data Intelligence Pipeline',
    description: 'This is where the magic starts. Ingest raw data, clean it automatically, and prepare it for deep neural analysis.',
    icon: Database,
    color: '#00D1FF'
  },
  {
    id: 'modeling',
    title: 'Neural Engine & Modeling',
    description: 'Our proprietary LLM-driven models analyze patterns that humans miss. Configure your decision engines and predictive models here.',
    icon: Cpu,
    color: '#FF00E5'
  },
  {
    id: 'insights',
    title: 'Visual Intelligence',
    description: 'Transform complex datasets into interactive dashboards. Real-time metrics, trend forecasting, and anomaly detection at your fingertips.',
    icon: BarChart3,
    color: '#00FF94'
  },
  {
    id: 'chat',
    title: 'AI Forensic Agent',
    description: 'Talk to your data. Ask questions, generate reports, and get strategic advice from your dedicated Analytix AI Assistant.',
    icon: MessageSquare,
    color: '#F97316'
  }
];

export default function Onboarding({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show onboarding only if it hasn't been completed
    const hasCompleted = localStorage.getItem('analytix_onboarding_completed');
    if (!hasCompleted) {
      setTimeout(() => setIsVisible(true), 1500); // Delayed entry for effect
    }
  }, []);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      finish();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const finish = () => {
    setIsVisible(false);
    localStorage.setItem('analytix_onboarding_completed', 'true');
    if (onComplete) onComplete();
  };

  const step = ONBOARDING_STEPS[currentStep];

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="onboarding-overlay">
          <motion.div 
            className="onboarding-card"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <button className="onboarding-close" onClick={finish}>
              <X size={20} />
            </button>

            <div className="onboarding-content">
              <div className="onboarding-illustration">
                <motion.div 
                  key={step.id}
                  initial={{ scale: 0.5, rotate: -10, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  className="onboarding-icon-wrap"
                  style={{ backgroundColor: `${step.color}20`, color: step.color }}
                >
                  <step.icon size={48} />
                  <div className="icon-glow" style={{ backgroundColor: step.color }}></div>
                </motion.div>
                
                <div className="onboarding-progress">
                  {ONBOARDING_STEPS.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`progress-dot ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`}
                      style={{ '--active-color': step.color }}
                    />
                  ))}
                </div>
              </div>

              <div className="onboarding-text">
                <motion.h2 
                  key={`title-${step.id}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  {step.title}
                </motion.h2>
                <motion.p
                  key={`desc-${step.id}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {step.description}
                </motion.p>
              </div>

              <div className="onboarding-actions">
                <button 
                  className={`btn-back ${currentStep === 0 ? 'hidden' : ''}`}
                  onClick={handleBack}
                >
                  <ChevronLeft size={18} />
                  Back
                </button>
                
                <button 
                  className="btn-next" 
                  onClick={handleNext}
                  style={{ backgroundColor: step.color }}
                >
                  {currentStep === ONBOARDING_STEPS.length - 1 ? (
                    <>Get Started <CheckCircle2 size={18} /></>
                  ) : (
                    <>Next <ChevronRight size={18} /></>
                  )}
                </button>
              </div>
            </div>

            <div className="onboarding-bg-effects">
              <div className="glow-1" style={{ backgroundColor: step.color }}></div>
              <div className="glow-2" style={{ backgroundColor: step.color }}></div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
