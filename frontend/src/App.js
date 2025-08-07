import React, { useState, useEffect, useMemo, useCallback } from "react";

import ThermoSenseContext from "./context/ThermoSenseContext";
import LoadingScreen from "./components/LoadingScreen";
import PermissionModal from "./components/PermissionModal";
import Navigation from "./components/Navigation";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import ChartDisplay from "./components/ChartDisplay";
import AIAdvisory from "./components/AIAdvisory";
import NotificationCenter from "./components/NotificationCenter";
import Settings from "./components/Settings";

import useBattery from "./hooks/useBattery";
import useWeather from "./hooks/useWeather";
import useDevicePerformance from "./hooks/useDevicePerformance";
import useMLModel from "./hooks/useMLModel";

import useLoadingSequence from "./hooks/useLoadingSequence";
import useTemperature from "./hooks/useTemperature";
import usePerformancePolling from "./hooks/usePerformancePolling";
import useAppHandlers from "./handlers/useAppHandlers";

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");

  const { weatherData, weatherStatus, fetchWeather } = useWeather();
  const { deviceTempData, fetchTemperature } = useTemperature();
  const { batteryData, batteryStatus, initializeBattery, retryBattery } = useBattery(deviceTempData);
 
  const [deviceTemp, setDeviceTemp] = useState(deviceTempData?.temperature ?? 27.5);
  useEffect(() => {
    if (deviceTempData?.temperature != null) {
      setDeviceTemp(deviceTempData.temperature);
    }
  }, [deviceTempData]);

  const { performanceData, updatePerformance } = useDevicePerformance();
  const { generateRecommendations } = useMLModel();

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [{ ...notification, id, timestamp: new Date() }, ...prev.slice(0, 99)]);
  }, []);

  const { loadingProgress, currentStep, loadingSteps } = useLoadingSequence(setIsLoading, setShowPermissionModal);

  usePerformancePolling(updatePerformance);

  const apiStatus = useMemo(
    () => ({
      battery: batteryStatus === "connected" ? "connected" : batteryStatus === "retrying" ? "retrying" : "disconnected",
      weather: weatherStatus === "connected" ? "connected" : weatherStatus === "retrying" ? "retrying" : "disconnected",
      performance: "connected",
    }),
    [batteryStatus, weatherStatus]
  );

  const healthData = useMemo(() => {
    return generateRecommendations(batteryData, weatherData, deviceTemp, performanceData);
  }, [batteryData, weatherData, deviceTemp, performanceData, generateRecommendations]);

  const notificationCount = useMemo(() => {
    return notifications.filter((n) => n.type === "critical" || n.type === "warning").length;
  }, [notifications]);

  const { handleAllowPermissions, handleThemeToggle, handleExport, handleTestNotification } = useAppHandlers({
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
  });

  const contextValue = {
    batteryData,
    deviceTemp,
    deviceTempData,
    weatherData,
    performanceData,
    deviceTempData,
    healthData,
    notifications,
    onRetryBattery: retryBattery,
    onFetchWeather: fetchWeather,
    addNotification,
  };

  return (
    <ThermoSenseContext.Provider value={contextValue}>
      <div className="app">
        <LoadingScreen isVisible={isLoading} progress={loadingProgress} currentStep={currentStep} steps={loadingSteps} />
        <PermissionModal isVisible={showPermissionModal} onAllow={handleAllowPermissions} />
        <Navigation apiStatus={apiStatus} onThemeToggle={handleThemeToggle} onExport={handleExport} />
        <div className="app-container">
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} notificationCount={notificationCount} />
          <main className="main-content">
            {activeTab === "dashboard" && <Dashboard />}
            {activeTab === "monitoring" && <ChartDisplay isVisible />}
            {activeTab === "advisory" && <AIAdvisory isVisible healthData={healthData} />}
            {activeTab === "notifications" && <NotificationCenter isVisible notifications={notifications} onClearAll={() => setNotifications([])} onTestNotification={handleTestNotification} />}
            {activeTab === "settings" && <Settings isVisible />}
          </main>
        </div>
      </div>
    </ThermoSenseContext.Provider>
  );
};

export default App;
