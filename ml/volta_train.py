"""
Volta LSTM Training Script
Predicts: longest single focus session in minutes
Features: sleep_length, sleep_quality, caffeine_mg, stress_level, ambient_sound, music
"""

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
import json
import os

# ── Config ──────────────────────────────────────────────────────────────────
SEQ_LEN = 3          # use last 3 days to predict next day
HIDDEN_SIZE = 32
NUM_LAYERS = 2
DROPOUT = 0.2
EPOCHS = 200
LR = 0.001
BATCH_SIZE = 8
SEED = 42

torch.manual_seed(SEED)
np.random.seed(SEED)

FEATURE_COLS = ['sleep_length', 'sleep_quality', 'caffeine_mg',
                'stress_level', 'ambient_sound', 'music']
TARGET_COL = 'focus'

# ── Load & preprocess data ───────────────────────────────────────────────────
def load_data(path: str) -> pd.DataFrame:
    df = pd.read_csv(path, parse_dates=['date'])
    df = df.sort_values('date').reset_index(drop=True)

    # Fill missing ambient_sound with median
    df['ambient_sound'] = df['ambient_sound'].fillna(df['ambient_sound'].median())

    print(f"Loaded {len(df)} days of data")
    print(f"Focus range: {df['focus'].min()} - {df['focus'].max()} minutes")
    print(f"Feature columns: {FEATURE_COLS}")
    return df


def create_sequences(features: np.ndarray, targets: np.ndarray, seq_len: int):
    X, y = [], []
    for i in range(len(features) - seq_len):
        X.append(features[i:i + seq_len])
        y.append(targets[i + seq_len])
    return np.array(X), np.array(y)


class FocusDataset(Dataset):
    def __init__(self, X, y):
        self.X = torch.FloatTensor(X)
        self.y = torch.FloatTensor(y)

    def __len__(self):
        return len(self.X)

    def __getitem__(self, idx):
        return self.X[idx], self.y[idx]


# ── Model ────────────────────────────────────────────────────────────────────
class VoltaLSTM(nn.Module):
    def __init__(self, input_size, hidden_size, num_layers, dropout):
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
        out = out[:, -1, :]   # take last timestep
        return self.head(out).squeeze(-1)


# ── Training ─────────────────────────────────────────────────────────────────
def train(model, loader, optimizer, criterion):
    model.train()
    total_loss = 0
    for X_batch, y_batch in loader:
        optimizer.zero_grad()
        pred = model(X_batch)
        loss = criterion(pred, y_batch)
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        optimizer.step()
        total_loss += loss.item()
    return total_loss / len(loader)


def evaluate(model, loader, criterion):
    model.eval()
    total_loss = 0
    with torch.no_grad():
        for X_batch, y_batch in loader:
            pred = model(X_batch)
            total_loss += criterion(pred, y_batch).item()
    return total_loss / len(loader)


# ── Uncertainty estimation ───────────────────────────────────────────────────
def predict_with_uncertainty(model, X_input, n_samples=50):
    """
    Monte Carlo dropout for uncertainty estimation.
    Enables dropout at inference time and runs multiple forward passes.
    """
    model.train()  # keep dropout active
    preds = []
    with torch.no_grad():
        for _ in range(n_samples):
            pred = model(X_input)
            preds.append(pred.item())
    model.eval()

    mean = np.mean(preds)
    std = np.std(preds)
    confidence = max(0.0, min(1.0, 1.0 - (std / (mean + 1e-6))))

    return {
        "predicted_focus_minutes": round(float(mean), 1),
        "std": round(float(std), 1),
        "confidence": round(float(confidence), 3),
        "lower_bound": round(float(mean - 1.96 * std), 1),
        "upper_bound": round(float(mean + 1.96 * std), 1),
    }


# ── ONNX export ───────────────────────────────────────────────────────────────
def export_onnx(model, seq_len, input_size, path="volta_model.onnx"):
    model.eval()
    dummy = torch.randn(1, seq_len, input_size)
    torch.onnx.export(
        model, dummy, path,
        input_names=["input"],
        output_names=["output"],
        dynamic_axes={"input": {0: "batch_size"}, "output": {0: "batch_size"}},
        opset_version=11
    )
    print(f"Model exported to {path}")


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    # Load data
    df = load_data("processed.csv")

    # Scale features and target
    feat_scaler = MinMaxScaler()
    target_scaler = MinMaxScaler()

    features_scaled = feat_scaler.fit_transform(df[FEATURE_COLS].values)
    targets_scaled = target_scaler.fit_transform(df[[TARGET_COL]].values).flatten()

    # Create sequences
    X, y = create_sequences(features_scaled, targets_scaled, SEQ_LEN)
    print(f"Sequences: {X.shape}, Targets: {y.shape}")

    # Train/val split (no shuffle - time series!)
    split = int(len(X) * 0.8)
    X_train, X_val = X[:split], X[split:]
    y_train, y_val = y[:split], y[split:]

    train_loader = DataLoader(FocusDataset(X_train, y_train), batch_size=BATCH_SIZE, shuffle=True)
    val_loader = DataLoader(FocusDataset(X_val, y_val), batch_size=BATCH_SIZE)

    # Init model
    model = VoltaLSTM(
        input_size=len(FEATURE_COLS),
        hidden_size=HIDDEN_SIZE,
        num_layers=NUM_LAYERS,
        dropout=DROPOUT
    )
    optimizer = torch.optim.Adam(model.parameters(), lr=LR, weight_decay=1e-4)
    criterion = nn.MSELoss()
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, patience=20, factor=0.5)

    # Train
    best_val_loss = float('inf')
    best_state = None

    for epoch in range(EPOCHS):
        train_loss = train(model, train_loader, optimizer, criterion)
        val_loss = evaluate(model, val_loader, criterion)
        scheduler.step(val_loss)

        if val_loss < best_val_loss:
            best_val_loss = val_loss
            best_state = {k: v.clone() for k, v in model.state_dict().items()}

        if (epoch + 1) % 20 == 0:
            # Convert loss back to minutes scale for interpretability
            val_mae_mins = np.sqrt(val_loss) * (target_scaler.data_max_[0] - target_scaler.data_min_[0])
            print(f"Epoch {epoch+1:3d} | train_loss: {train_loss:.4f} | val_loss: {val_loss:.4f} | ~val_MAE: {val_mae_mins:.1f} min")

    # Load best model
    model.load_state_dict(best_state)
    print(f"\nBest val loss: {best_val_loss:.4f}")

    # Save model + scalers
    torch.save(model.state_dict(), "volta_model.pt")
    np.save("feat_scaler_min.npy", feat_scaler.data_min_)
    np.save("feat_scaler_max.npy", feat_scaler.data_max_)
    np.save("target_scaler_min.npy", target_scaler.data_min_)
    np.save("target_scaler_max.npy", target_scaler.data_max_)

    # Save scaler params as JSON for FastAPI
    scaler_params = {
        "features": FEATURE_COLS,
        "feat_min": feat_scaler.data_min_.tolist(),
        "feat_max": feat_scaler.data_max_.tolist(),
        "target_min": float(target_scaler.data_min_[0]),
        "target_max": float(target_scaler.data_max_[0]),
        "seq_len": SEQ_LEN,
    }
    with open("scaler_params.json", "w") as f:
        json.dump(scaler_params, f, indent=2)
    print("Scaler params saved to scaler_params.json")

    # Demo prediction with uncertainty
    print("\n── Sample prediction ──")
    last_seq = torch.FloatTensor(features_scaled[-SEQ_LEN:]).unsqueeze(0)
    result = predict_with_uncertainty(model, last_seq)

    # Denormalize
    scale = target_scaler.data_max_[0] - target_scaler.data_min_[0]
    offset = target_scaler.data_min_[0]
    result["predicted_focus_minutes"] = round(result["predicted_focus_minutes"] * scale + offset, 1)
    result["lower_bound"] = round(result["lower_bound"] * scale + offset, 1)
    result["upper_bound"] = round(result["upper_bound"] * scale + offset, 1)

    print(f"Predicted focus: {result['predicted_focus_minutes']} min")
    print(f"95% interval: [{result['lower_bound']}, {result['upper_bound']}] min")
    print(f"Confidence: {result['confidence']}")

    # Export to ONNX
    export_onnx(model, SEQ_LEN, len(FEATURE_COLS))

    print("\nDone! Files saved:")
    print("  volta_model.pt      — PyTorch weights")
    print("  volta_model.onnx    — ONNX export")
    print("  scaler_params.json  — normalization params for FastAPI")


if __name__ == "__main__":
    main()
