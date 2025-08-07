import { useEffect } from 'react';
import axios from 'axios';

const useDeviceTempFetcher = (latitude, longitude, setDeviceTemp) => {
  useEffect(() => {
    const fetchTemp = async () => {
      try {
        const response = await axios.post('http://localhost:8000/log', {
          latitude,
          longitude
        });

        if (response.data?.temperature_c !== undefined) {
          setDeviceTemp(response.data.temperature_c);
        }
      } catch (error) {
        console.error('Failed to fetch device temp:', error);
      }
    };

    // Initial fetch
    fetchTemp();

    const interval = setInterval(fetchTemp, 15000); // every 15 sec
    return () => clearInterval(interval);
  }, [latitude, longitude, setDeviceTemp]);
};

export default useDeviceTempFetcher;
