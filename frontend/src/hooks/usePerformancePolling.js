import { useEffect } from 'react';

const usePerformancePolling = (updatePerformance) => {
  useEffect(() => {
    const interval = setInterval(() => {
      updatePerformance();
    }, 10000);
    return () => clearInterval(interval);
  }, [updatePerformance]);
};

export default usePerformancePolling;
