import requests
from datetime import datetime

def fetch_weather(latitude, longitude):
    try:
        response = requests.get(
            f"https://api.open-meteo.com/v1/forecast",
            params={
                "latitude": latitude,
                "longitude": longitude,
                "current": "temperature_2m",
                "timezone": "auto"
            },
            timeout=10
        )
        response.raise_for_status()
        data = response.json()

        return {
            "temperature": data["current"]["temperature_2m"],
            "last_update": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
    except Exception as e:
        print(f"[weather_fetcher] Error: {e}")
        return None
