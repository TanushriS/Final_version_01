import csv
import os

# Determine the log file path in the parent directory's logs folder
parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
log_dir = os.path.join(parent_dir, "logs")
os.makedirs(log_dir, exist_ok=True)  # Ensure the logs directory exists

LOG_FILE = os.path.join(log_dir, "temperature_log.csv")

def read_last_n_records(n=10):
    if not os.path.exists(LOG_FILE):
        return []

    with open(LOG_FILE, mode='r', newline='') as f:
        reader = list(csv.DictReader(f))
        return reader[-n:]  # Return the last n rows
