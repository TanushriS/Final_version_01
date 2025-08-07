import { useEffect, useState } from 'react';

const useLoadingSequence = (setIsLoading, setShowPermissionModal) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [loadingSteps, setLoadingSteps] = useState([
    { text: 'Starting ThermoSense...', status: 'pending' },
    { text: 'Checking browser compatibility...', status: 'pending' },
    { text: 'Requesting location access...', status: 'pending' },
    { text: 'Connecting to weather service...', status: 'pending' },
    { text: 'Initializing battery monitoring...', status: 'pending' },
    { text: 'Setting up real-time updates...', status: 'pending' }
  ]);

  useEffect(() => {
    const runLoadingSequence = async () => {
      const steps = [
        { duration: 500 }, { duration: 1000 }, { duration: 1500 },
        { duration: 1000 }, { duration: 1000 }, { duration: 500 }
      ];

      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(loadingSteps[i].text);
        setLoadingSteps(prev =>
          prev.map((s, idx) => idx === i ? { ...s, status: 'active' } : s)
        );
        await new Promise(res => setTimeout(res, steps[i].duration));
        setLoadingSteps(prev =>
          prev.map((s, idx) => idx === i ? { ...s, status: 'completed' } : s)
        );
        setLoadingProgress(((i + 1) / steps.length) * 100);
      }

      setTimeout(() => {
        setIsLoading(false);
        setShowPermissionModal(true);
      }, 1000);
    };

    runLoadingSequence();
  }, []);

  return { loadingProgress, currentStep, loadingSteps };
};

export default useLoadingSequence;
