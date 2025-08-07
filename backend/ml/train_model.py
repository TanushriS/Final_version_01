import os
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
import joblib

# Directory to store model files
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODEL_DIR, exist_ok=True)

MODEL_PATH = os.path.join(MODEL_DIR, "model.pkl")
ENCODER_PATH = os.path.join(MODEL_DIR, "encoder.pkl")
COLUMN_PATH = os.path.join(MODEL_DIR, "columns.pkl")
DATA_PATH = 'thermosense_test_data.csv'

def train_and_save():
    df = pd.read_csv(DATA_PATH)

    features = ['battery_temp', 'ambient_temp', 'device_state']
    target = 'measured_health_impact'

    encoder = OneHotEncoder(sparse_output=False)
    device_state_encoded = encoder.fit_transform(df[['device_state']])
    device_state_df = pd.DataFrame(device_state_encoded, columns=encoder.get_feature_names_out(['device_state']))

    X = pd.concat([df[['battery_temp', 'ambient_temp']].reset_index(drop=True), device_state_df], axis=1)
    y = df[target]

    X_train, _, y_train, _ = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    joblib.dump(model, MODEL_PATH)
    joblib.dump(encoder, ENCODER_PATH)
    joblib.dump(X.columns.tolist(), COLUMN_PATH)
    
    print("Model and encoder trained and saved.")
