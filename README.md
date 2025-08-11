# Thermosense  
*A machine learning-based web application to predict Battery health risks with respect to environmental temperature *  

![Dashboard Preview](https://github.com/TanushriS/assets/blob/main/dashboard.png)

## 📌 Features  
✅ **User-Friendly Dashboard**: Interactive and responsive UI for inputting Battery health and environmental data.  
✅ **ML-Powered Predictions**: Use Gemini 2.5 Flash used for LLM based response.  
✅ **React Frontend**: Modern and dynamic user interface built with React.  
✅ **Data Visualization**: Charts and graphs to visualize health data and risk factors.  
✅ **Live API Docs**: Automatic interactive API documentation 


## ⚙️ Tech Stack  
- **Frontend**: React.js, TailwindCSS  
- **Backend**: FastAPI (Python)  
- **Machine Learning**: Gemini 2.5 Fllash, Ski-learn
- **Device Sensor Data**: LibreHardwareMonitore

## 🚀 Setup & Installation  

### Prerequisites  
- Python 3.10+  
- Node.js & npm  
- Git  

### 1. Clone the Repository  
```bash
git clone https://github.com/TanushriS/Final_version_01.git
cd Final_version_012. Backend Setup'
```

## 2. Backend Setup (Run as Administrator)
```bash
cd backend
uvicorn main:app --reload
```

## 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

## 4. Machine Learning Model
 - Place your trained model (e.g., model.pkl) in backend/models/.
 - Ensure MODEL_PATH in backend/ml/predictor.py points to your model file.


## 🌐 API Endpoints
Endpoint	Method	Description
 - /predict	POST	Accepts JSON data, returns prediction
 - /docs	GET	Interactive OpenAPI docs
Example Request:

```json
{
  "Battery Temp": 45,
  "Ambiant temp": 35,
  "Risk": Safe
}
```

## 📂 Project Structure
```text
Final_version_01/
├── backend/           # FastAPI server
│   ├── main.py        # API routes
│   ├── ml/            # ML prediction logic
│   └── models/        # Trained model (.pkl)
├── frontend/          # React app
│   ├── src/           # Components, pages
│   └── public/        # Static assets
└── README.md          # This file
```
## 🛠 Troubleshooting
Model Not Found?
 - Verify model.pkl is in backend/models/ and the path in predictor.py is correct.

Port Conflicts?

 - FastAPI: uvicorn main:app --reload --port 8001

 - React: Update frontend/package.json with "start": "PORT=3001 react-scripts start"

Dependency Issues?

 - Backend: pip freeze > requirements.txt

 - Frontend: npm install --save <package-name>
