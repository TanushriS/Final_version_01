import { useRef, useEffect, useCallback } from "react";

const useAppHandlers = ({
  initializeBattery,
  fetchWeather,
  fetchTemperature,
  addNotification,
  batteryData,
  weatherData,
  performanceData,
  deviceTempData,
  healthData,
  notifications,
  apiStatus,
  setShowPermissionModal,
  }) => {
  const weatherIntervalRef = useRef(null);
  const temperatureIntervalRef = useRef(null);
  
  const startWeatherPolling = () => {
    if (weatherIntervalRef.current) return; // Avoid duplicate intervals

    weatherIntervalRef.current = setInterval(() => {
      fetchWeather();
    }, 5 * 60 * 1000); // 5 minutes
  };

  const startTemperaturePolling = () => {
    if (temperatureIntervalRef.current) return;
    temperatureIntervalRef.current = setInterval(() => {
      fetchTemperature();
    }, 5 * 1000); // Every 5 seconds
  };

  const handleAllowPermissions = async () => {
    setShowPermissionModal(false);
    try {
      await Promise.all([initializeBattery(), fetchWeather()]);
      addNotification({ type: "info", message: "✅ Monitoring permissions enabled successfully" });

      // Start polling after permissions are granted
      startWeatherPolling();
      startTemperaturePolling();
    } catch {
      addNotification({ type: "warning", message: "⚠️ Some permissions failed — limited mode" });
    }
  };

  const handleThemeToggle = useCallback(() => {
    const current = document.documentElement.getAttribute("data-color-scheme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-color-scheme", next);
    localStorage.setItem("thermosense-theme", next);
  }, []);

  const handleExport = useCallback(() => {
    const data = {
      timestamp: new Date().toISOString(),
      batteryData,
      weatherData,
      performanceData,
      deviceTempData,
      healthData,
      notifications,
      apiStatus,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `thermosense-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addNotification({ type: "info", message: "📊 Data exported successfully" });
  }, [batteryData, weatherData, performanceData, deviceTempData, healthData, notifications, apiStatus, addNotification]);

  const handleTestNotification = useCallback(() => {
    addNotification({ type: "info", message: "🧪 Test notification — system working properly" });
  }, [addNotification]);


  return {
    handleAllowPermissions,
    handleThemeToggle,
    handleExport,
    handleTestNotification,
  };
};

export default useAppHandlers;
