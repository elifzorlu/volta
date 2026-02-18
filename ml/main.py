"""
Volta ML API — FastAPI server
Deploy this to Railway/Render to get a live prediction endpoint.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
import torch.nn as nn
import numpy as np
import json
from typing import Optional

app = FastAPI(title="Volta ML API", version="1.0.0")

# Allow your Volta frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this to volta-productivity.com in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load model + scaler params on startup ────────────────────────────────────

class VoltaLSTM(nn.Module):
    def __init__(self, input_size=6, hidden_size=32, num_layers=2, dropout=0.2):
        super().__init__()
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            dropout=dropout if num_layers > 1 else 0,
            batch_first=True
        )
        self.head = nn.Sequential(
            nn.Linear(hidden_size, 16),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(16, 1)
        )

    def forward(self, x):
        out, _ = self.lstm(x)
        out = out[:, -1, :]
        return self.head(out).squeeze(-1)


# Load on startup
with open("scaler_params.json") as f:
    SCALER = json.load(f)

FEAT_MIN = np.array(SCALER["feat_min"])
FEAT_MAX = np.array(SCALER["feat_max"])
TARGET_MIN = SCALER["target_min"]
TARGET_MAX = SCALER["target_max"]
SEQ_LEN = SCALER["seq_len"]
FEATURES = SCALER["features"]

model = VoltaLSTM()
model.load_state_dict(torch.load("volta_model.pt", map_location="cpu"))
model.eval()

print("✅ Volta ML model loaded")


# ── Request / Response schemas ───────────────────────────────────────────────

class DayLog(BaseModel):
    # Supabase field names — matches your daily_logs table exactly
    sleep_hours: float                          # numeric
    sleep_quality: str                          # "excellent", "good", "fair", "poor"
    caffeine_total: float                       # int4
    energy_level: str                           # "high", "medium", "low"
    stress_level: Optional[float] = 5.0        # optional, default medium
    music: Optional[int] = 1                   # 1 = yes music, 0 = no music


# Map Supabase text values to numbers for the model
SLEEP_QUALITY_MAP = {"excellent": 3, "good": 2, "fair": 1, "poor": 0}
ENERGY_LEVEL_MAP  = {"high": 3, "medium": 2, "low": 1}
DEFAULT_AMBIENT   = 55.0   # median from training data

def daylog_to_features(d: DayLog) -> list:
    return [
        d.sleep_hours,
        SLEEP_QUALITY_MAP.get(d.sleep_quality.lower(), 2),
        d.caffeine_total,
        d.stress_level or 5.0,
        DEFAULT_AMBIENT,
        d.music if d.music is not None else 1,
    ]

class PredictRequest(BaseModel):
    recent_days: list[DayLog]  # must be exactly SEQ_LEN (3) days, oldest first

class CounterfactualRequest(BaseModel):
    recent_days: list[DayLog]
    what_if: DayLog            # the hypothetical next day inputs

class PredictionResponse(BaseModel):
    predicted_focus_minutes: float
    lower_bound: float
    upper_bound: float
    confidence: float
    message: str


# ── Helper functions ─────────────────────────────────────────────────────────

def scale_features(days: list[DayLog]) -> np.ndarray:
    arr = np.array([daylog_to_features(d) for d in days])
    return (arr - FEAT_MIN) / (FEAT_MAX - FEAT_MIN + 1e-8)


def denormalize(val: float) -> float:
    return val * (TARGET_MAX - TARGET_MIN) + TARGET_MIN


def predict_with_uncertainty(X: np.ndarray, n_samples=50) -> dict:
    tensor = torch.FloatTensor(X).unsqueeze(0)
    model.train()  # MC dropout
    preds = []
    with torch.no_grad():
        for _ in range(n_samples):
            preds.append(model(tensor).item())
    model.eval()

    mean = np.mean(preds)
    std = np.std(preds)
    confidence = float(max(0.0, min(1.0, 1.0 - (std / (abs(mean) + 1e-6)))))

    return {
        "predicted_focus_minutes": round(denormalize(mean), 1),
        "lower_bound": round(denormalize(mean - 1.96 * std), 1),
        "upper_bound": round(denormalize(mean + 1.96 * std), 1),
        "confidence": round(confidence, 3),
    }


def focus_message(minutes: float, confidence: float) -> str:
    conf_str = "High" if confidence > 0.8 else "Medium" if confidence > 0.6 else "Low"
    if minutes >= 90:
        return f"🔥 Strong focus day ahead — up to {minutes:.0f} min deep work predicted. ({conf_str} confidence)"
    elif minutes >= 60:
        return f"✅ Solid focus expected — around {minutes:.0f} min. ({conf_str} confidence)"
    elif minutes >= 40:
        return f"⚡ Moderate focus day — aim for {minutes:.0f} min sessions. ({conf_str} confidence)"
    else:
        return f"😴 Low focus predicted — {minutes:.0f} min. Prioritize rest. ({conf_str} confidence)"


# ── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "Volta ML API is running 🚀"}


@app.post("/predict", response_model=PredictionResponse)
def predict(req: PredictRequest):
    if len(req.recent_days) != SEQ_LEN:
        raise HTTPException(
            status_code=400,
            detail=f"Provide exactly {SEQ_LEN} days of data (oldest first)."
        )

    X = scale_features(req.recent_days)
    result = predict_with_uncertainty(X)
    result["message"] = focus_message(result["predicted_focus_minutes"], result["confidence"])
    return result


@app.post("/counterfactual", response_model=PredictionResponse)
def counterfactual(req: CounterfactualRequest):
    """
    What-if prediction: given your recent days, what would focus be
    if tomorrow's inputs were different?
    e.g. 'what if I slept 8h instead of 5h?'
    """
    if len(req.recent_days) != SEQ_LEN:
        raise HTTPException(
            status_code=400,
            detail=f"Provide exactly {SEQ_LEN} recent days."
        )

    # Use last 2 real days + the hypothetical day as the sequence
    combined = req.recent_days[1:] + [req.what_if]
    X = scale_features(combined)
    result = predict_with_uncertainty(X)
    result["message"] = f"What-if: {focus_message(result['predicted_focus_minutes'], result['confidence'])}"
    return result


@app.get("/health")
def health():
    return {"status": "ok", "model": "VoltaLSTM", "seq_len": SEQ_LEN}