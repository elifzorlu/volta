import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import train_test_split
import joblib
import os

DATA_PATH = "ml/data/processed.csv"
MODEL_PATH = "ml/artifacts/gb_model.joblib"

def load_data():
    df = pd.read_csv(DATA_PATH)
    return df

def time_split(df, target_col="focus"):
    df = df.sort_values("date")

    X = df.drop(columns=[target_col])

    if "date" in X.columns:
     X = X.drop(columns=["date"])

    y = df[target_col]

   

    split_index = int(len(df) * 0.8)

    X_train = X.iloc[:split_index]
    y_train = y.iloc[:split_index]
    X_test = X.iloc[split_index:]
    y_test = y.iloc[split_index:]

    return X_train, X_test, y_train, y_test

def train():
    df = load_data()

    X_train, X_test, y_train, y_test = time_split(df)

    model = GradientBoostingRegressor(
        n_estimators=200,
        learning_rate=0.05,
        max_depth=3,
        random_state=42
    )

    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)

    print(f"Test MAE: {mae:.4f}")

    os.makedirs("ml/artifacts", exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    print("Model saved.")

if __name__ == "__main__":
    train()

