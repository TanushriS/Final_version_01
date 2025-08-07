import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const useWeather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [weatherStatus, setWeatherStatus] = useState("disconnected");

  const fetchWeather = useCallback(async () => {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000,
        });
      });

      const { latitude, longitude } = position.coords;
      setWeatherStatus("retrying");

      // Use GET with query params
      const response = await axios.get("http://localhost:8000/weather", {
        params: { latitude, longitude },
      });

      const data = response.data;

      if (data?.temperature !== undefined) {
        console.log("API - Fetching Weather", data);
        setWeatherData({
          temperature: parseFloat(data.temperature),
          last_update: data.last_update || new Date().toISOString(),
        });

        setWeatherStatus("connected");
      } else if (typeof data === "number") {
        setWeatherData(data);
        setWeatherStatus("connected");
      } else {
        setWeatherStatus("disconnected");
      }
    } catch (error) {
      console.error("Weather fetch failed:", error);
      setWeatherStatus("disconnected");
    }
  }, []);

  return { weatherData, weatherStatus, fetchWeather };
};

export default useWeather;
