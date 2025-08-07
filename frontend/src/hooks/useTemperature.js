import { useState, useCallback } from "react";
import axios from "axios";

const useTemperature = () => {
  const [deviceTempData, setDeviceTempData] = useState(null);

  const fetchTemperature = useCallback(async () => {
    try {
      // Send weather temperature to the backend
      const response = await axios.get("http://localhost:8000/temperature");

      const data = response.data;

      if (data && typeof data.temperature_c === "number") {
        console.log("API - Logging Device Temp", data);

        setDeviceTempData({
          temperature: parseFloat(data.temperature_c),
          timestamp: data.timestamp,
          charging: data.charging,
          batteryPercent: data.battery_percent,
        });
      } else {
        console.warn("Unexpected log response:", data);
      }
    } catch (error) {
      console.error("Log request failed:", error);
    }
  });

  return { deviceTempData, fetchTemperature };
};

export default useTemperature;
