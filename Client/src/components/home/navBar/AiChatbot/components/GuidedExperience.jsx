import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export const GuidedExperience = ({ 
  currentStep: externalStep,
}) => {
  const [currentStep, setCurrentStep] = useState(externalStep || 0);

  useEffect(() => {
    if (externalStep !== undefined) {
      setCurrentStep(externalStep);
    }
  }, [externalStep]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="guided-experience-container"
    >
      <div className="progress-bar mb-4">
        <div 
          className="progress-fill h-2 bg-red-600 rounded-full transition-all duration-300"
          style={{ width: `${((currentStep + 1) / 4) * 100}%` }}
        ></div>
      </div>
      
      <div className="step-indicator text-sm text-gray-500 dark:text-gray-400 mb-4">
        Step {currentStep + 1} of 4
      </div>
      
      {/* Step content will be rendered by parent component */}
    </motion.div>
  );
};

export default GuidedExperience;