import { useState, useRef, useCallback, useEffect } from "react";

const useBattery = (deviceTempData = null) => {
  const [batteryData, setBatteryData] = useState(null);
  const [batteryStatus, setBatteryStatus] = useState("disconnected");
  const [retryCount, setRetryCount] = useState(0);
  const batteryRef = useRef(null);

  const initializeBattery = useCallback(async () => {
    try {
      if ("getBattery" in navigator) {
        const battery = await navigator.getBattery();
        batteryRef.current = battery;

        const updateBatteryData = () => {
          // If deviceTempData exists, completely override dummy batteryData
          if (deviceTempData) {
            setBatteryData({
              level: deviceTempData.batteryPercent,
              charging: deviceTempData.charging,
              chargingTime: null,
              dischargingTime: null,
              lastUpdate: new Date(deviceTempData.timestamp),
              deviceTemp: deviceTempData.temperature_c,
              source: "Device Data",
            });
          } else {
            setBatteryData({
              level: Math.round(battery.level * 100),
              charging: battery.charging,
              chargingTime: battery.chargingTime,
              dischargingTime: battery.dischargingTime,
              lastUpdate: new Date(),
              source: "simulated",
            });
          }
        };

        battery.addEventListener("chargingchange", updateBatteryData);
        battery.addEventListener("levelchange", updateBatteryData);
        battery.addEventListener("chargingtimechange", updateBatteryData);
        battery.addEventListener("dischargingtimechange", updateBatteryData);

        updateBatteryData();
        setBatteryStatus("connected");

        return { success: true };
      } else {
        setBatteryStatus("disconnected");

        if (deviceTempData) {
          setBatteryData({
            level: deviceTempData.batteryPercent,
            charging: deviceTempData.charging,
            chargingTime: null,
            dischargingTime: null,
            lastUpdate: new Date(deviceTempData.timestamp),
            deviceTemp: deviceTempData.temperature_c,
            source: "Device Data",
          });
        } else {
          setBatteryData({
            level: 85,
            charging: Math.random() > 0.5,
            chargingTime: 7200,
            dischargingTime: 14400,
            lastUpdate: new Date(),
            simulated: true,
            source: "simulated",
          });
        }

        return {
          success: false,
          error: "Battery API not supported or using override",
        };
      }
    } catch (error) {
      setBatteryStatus("disconnected");

      if (deviceTempData) {
        setBatteryData({
          level: deviceTempData.batteryPercent,
          charging: deviceTempData.charging,
          chargingTime: null,
          dischargingTime: null,
          lastUpdate: new Date(deviceTempData.timestamp),
          deviceTemp: deviceTempData.temperature_c,
          source: "deviceTempData",
        });
      } else {
        setBatteryData({
          level: 75,
          charging: false,
          chargingTime: Infinity,
          dischargingTime: 18000,
          lastUpdate: new Date(),
          simulated: true,
          source: "fallback",
        });
      }

      return { success: false, error: error.message };
    }
  }, [deviceTempData]);

  const retryBattery = useCallback(async () => {
    setRetryCount((prev) => prev + 1);
    setBatteryStatus("retrying");
    const result = await initializeBattery();
    if (!result.success) {
      setBatteryStatus("disconnected");
    }
    return result;
  }, [initializeBattery]);

  return { batteryData, batteryStatus, initializeBattery, retryBattery };
};

export default useBattery;
