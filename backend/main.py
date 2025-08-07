from typing import Optional
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import joblib
import os

from ml.train_model import train_and_save
from ml.predictor import predict_health_impact
from gemini_advisor import get_gemini_advice

from core.temperature_logger import log_temperature, get_temperature
from core.temperature_reader import read_last_n_records
from core.weather_fetcher import fetch_weather

app = FastAPI(title="ThermoSense ML + Gemini Advisory")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
MODEL_PATH = os.path.join(MODEL_DIR, "model.pkl")
ENCODER_PATH = os.path.join(MODEL_DIR, "encoder.pkl")
COLUMN_PATH = os.path.join(MODEL_DIR, "columns.pkl")

# Check if model, encoder, and column list exist
if not (os.path.exists(MODEL_PATH) and os.path.exists(ENCODER_PATH) and os.path.exists(COLUMN_PATH)):
    print("Model, encoder, or column file not found. Training...")
    train_and_save()

# Load model and encoder
model = joblib.load(MODEL_PATH)
encoder = joblib.load(ENCODER_PATH)
print("Model and encoder loaded.")


# ========== Pydantic Models ==========
class SensorInput(BaseModel):
    battery_temp: float
    ambient_temp: float
    device_state: str
    battery_level: Optional[int] = 75
    cpu_temp: Optional[float] = None

class WeatherLog(BaseModel):
    temperature: float

# ========== Helper Functions ==========
def get_alert_level(impact):
    if impact > 0.07:
        return "danger"
    elif impact > 0.04:
        return "warning"
    else:
        return "safe"


# ========== API Endpoints ==========
@app.get("/")
def home():
    return {"message": "Welcome to ThermoSense Advisory API with Gemini AI"}

@app.get("/log")
async def log_all(
    temperature: Optional[float] = Query(None, description="Device temperature in Celsius")
):
    result = log_temperature(temperature)
    if result:
        return result
    else:
        return JSONResponse(status_code=500, content={"error": "Failed to log data"})

@app.get("/weather")
def get_weather_temp(
    latitude: float = Query(...),
    longitude: float = Query(...)
    ):
    weather = fetch_weather(latitude, longitude)
    if weather:
        return weather
    else:
        return JSONResponse(status_code=500, content={"error": "Temperature read failed"})

@app.get("/temperature")
def get_and_log_temp():
    result = get_temperature()
    return result or {"error": "Temperature read failed"}

@app.get("/history")
def get_history(n: int = 10):
    return read_last_n_records(n)


@app.post("/api/advice")
async def get_advice(input: SensorInput):
    try:
        # Get prediction from separated module
        impact = predict_health_impact(
            battery_temp=input.battery_temp,
            ambient_temp=input.ambient_temp,
            device_state=input.device_state
        )
        
        # Get Gemini advice
        gemini_response = get_gemini_advice(
            battery_temp=input.battery_temp,
            ambient_temp=input.ambient_temp,
            device_state=input.device_state,
            battery_level=input.battery_level,
            cpu_temp=input.cpu_temp
        )
        
        # Combine ML prediction with Gemini advice
        response = {
            "predicted_health_impact": round(float(impact), 5),
            "alert_level": gemini_response["alert_level"],
            "natural_language_tip": gemini_response["natural_language_tip"],
            "optional_action": gemini_response["optional_action"],
        }
        
        print(response)
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

