"""CI/CD Anomaly Detection API.

Scores a single pipeline run with two models (Isolation Forest and XGBoost)
and returns a combined verdict, a severity level and a recommendation.
"""

import json
import uuid
from datetime import datetime
from pathlib import Path

import joblib
import pandas as pd
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

MODEL_DIR = Path(__file__).parent / "preprocessing" / "models"

# Address of the dashboard during local development.
ALLOWED_ORIGINS = ["http://localhost:5173"]

FEATURES = [
    "build_duration_sec", "test_duration_sec", "deploy_duration_sec",
    "cpu_usage_pct", "memory_usage_mb",
    "ci_tool", "language", "os",
    "cloud_provider", "is_flaky_test",
]

app = FastAPI(title="CI/CD Anomaly Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

iso_model = joblib.load(MODEL_DIR / "isolation_forest.pkl")
xgb_model = joblib.load(MODEL_DIR / "xgboost.pkl")

with open(MODEL_DIR / "thresholds.json") as f:
    thresholds = json.load(f)

# In-memory store: cleared whenever the server restarts.
history = []


class PipelineInput(BaseModel):
    build_duration_sec: float
    test_duration_sec: float
    deploy_duration_sec: float
    cpu_usage_pct: float
    memory_usage_mb: float
    ci_tool: int
    language: int
    os: int
    cloud_provider: int
    is_flaky_test: int


def get_recommendation(data: dict, xgb_prob: float) -> str:
    if data["deploy_duration_sec"] > thresholds["deploy_duration_sec"]:
        return "Deploy duration is too high. Check deployment scripts and server health."
    if data["cpu_usage_pct"] > thresholds["cpu_usage_pct"]:
        return "CPU usage exceeded safe threshold. Consider scaling resources."
    if data["memory_usage_mb"] > thresholds["memory_usage_mb"]:
        return "Memory usage is abnormally high. Check for memory leaks."
    if data["build_duration_sec"] > thresholds["build_duration_sec"]:
        return "Build duration is unusually long. Review dependency caching."
    if xgb_prob > 0.7:
        return "Multiple metrics are elevated. Investigate pipeline logs."
    return "Pipeline run is within normal parameters. No action required."


def get_severity(xgb_prob: float, iso_flag: bool) -> str:
    if xgb_prob >= 0.9 and iso_flag:
        return "CRITICAL"
    if xgb_prob >= 0.7:
        return "HIGH"
    if xgb_prob >= 0.5 or iso_flag:
        return "MEDIUM"
    return "LOW"


@app.get("/health")
def health():
    return {"status": "running", "models": ["isolation_forest", "xgboost"]}


@app.post("/predict")
def predict(data: PipelineInput):
    payload = data.model_dump()
    df = pd.DataFrame([payload])[FEATURES]

    xgb_prob = float(xgb_model.predict_proba(df)[0][1])
    xgb_pred = "ANOMALY" if xgb_prob >= 0.7 else "NORMAL"
    confidence = "HIGH" if xgb_prob >= 0.85 or xgb_prob <= 0.15 else "MEDIUM"

    iso_score = float(iso_model.decision_function(df)[0] * -1)
    iso_flag = bool(iso_model.predict(df)[0] == -1)

    combined = "ANOMALY DETECTED" if (xgb_pred == "ANOMALY" or iso_flag) else "NORMAL"

    result = {
        "run_id": f"run_{uuid.uuid4().hex[:8]}",
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "combined_verdict": combined,
        "severity": get_severity(xgb_prob, iso_flag),
        "recommendation": get_recommendation(payload, xgb_prob),
        "xgboost": {
            "prediction": xgb_pred,
            "failure_probability": round(xgb_prob * 100, 2),
            "confidence": confidence,
        },
        "isolation_forest": {
            "prediction": "ANOMALY" if iso_flag else "NORMAL",
            "anomaly_score": round(iso_score, 4),
            "flag": iso_flag,
        },
        "input": payload,
    }

    history.append(result)
    return result


@app.get("/history")
def get_history():
    return list(reversed(history))


@app.get("/stats")
def get_stats():
    total = len(history)
    anomalies = sum(1 for r in history if r["combined_verdict"] == "ANOMALY DETECTED")
    return {
        "total_runs": total,
        "anomalies_detected": anomalies,
        "normal_runs": total - anomalies,
        "anomaly_rate": round(anomalies / total * 100, 1) if total > 0 else 0,
    }


if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
