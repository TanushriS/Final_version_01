import pandas as pd
import joblib
import os

MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "models")

MODEL_PATH = os.path.join(MODEL_DIR, "model.pkl")
ENCODER_PATH = os.path.join(MODEL_DIR, "encoder.pkl")
COLUMN_PATH = os.path.join(MODEL_DIR, "columns.pkl")

# Lazy loading for efficiency
columns = joblib.load(COLUMN_PATH)
model = joblib.load(MODEL_PATH)
encoder = joblib.load(ENCODER_PATH)

def predict_health_impact(battery_temp, ambient_temp, device_state):
    input_df = pd.DataFrame([{
        "battery_temp": battery_temp,
        "ambient_temp": ambient_temp,
        "device_state": device_state
    }])

    encoded_state = encoder.transform(input_df[["device_state"]])
    encoded_df = pd.DataFrame(
        encoded_state, 
        columns=encoder.get_feature_names_out(["device_state"])
    )

    X_live = pd.concat(
        [input_df[["battery_temp", "ambient_temp"]].reset_index(drop=True), encoded_df],
        axis=1
    )

    X_live = X_live.reindex(columns=columns, fill_value=0)
    prediction = model.predict(X_live)[0]

    return float(prediction)
