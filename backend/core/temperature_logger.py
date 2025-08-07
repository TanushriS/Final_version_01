import csv
import os
from datetime import datetime
from core.sensor_reader import get_core_average_temperature
from core.battery_state import get_battery_state

# Get the directory one level above the current file
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# Create a path to the logs folder in the parent directory
log_dir = os.path.join(parent_dir, "logs")
os.makedirs(log_dir, exist_ok=True)

# Full path to the log file
LOG_FILE = os.path.join(log_dir, "temperature_log.csv")

# Write headers if file doesn't exist
if not os.path.exists(LOG_FILE):
    with open(LOG_FILE, mode='w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(["timestamp", "temperature_c", "charging", "battery_percent"])

def get_temperature(weather_temp=None):
    temp = get_core_average_temperature()
    battery = get_battery_state()
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    if temp is not None and battery:
        row = [timestamp, temp, battery["charging"], battery["battery_percent"]]
        with open(LOG_FILE, mode='a', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(row)
        return {
            "timestamp": timestamp,
            "temperature_c": temp,
            "charging": battery["charging"],
            "battery_percent": battery["battery_percent"]
        }

    return None

def log_temperature(weather_temp=None):
    temp = get_core_average_temperature()
    battery = get_battery_state()
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    if temp is not None and battery:
        row = [timestamp, temp, battery["charging"], battery["battery_percent"]]
        with open(LOG_FILE, mode='a', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(row)
        return {
            "timestamp": timestamp,
            "temperature_c": temp,
            "charging": battery["charging"],
            "battery_percent": battery["battery_percent"]
        }

    return None
