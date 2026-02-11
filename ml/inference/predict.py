
import pandas as pd
import joblib

MODEL_PATH = "ml/artifacts/gb_model.joblib"
DATA_PATH = "ml/data/processed.csv"

def predict_latest():
    model = joblib.load(MODEL_PATH)

    df = pd.read_csv(DATA_PATH)
    latest = df.sort_values("date").iloc[-1:]

    X = latest.drop(columns=["focus"])
    pred = model.predict(X)

    print(f"Predicted next-day focus: {pred[0]:.2f}")

if __name__ == "__main__":
    predict_latest()
