"""
predictor.py — Model loading and prediction logic
Loads all three .pkl files once at startup and exposes predict().
"""
import os
import json
from datetime import datetime, timezone

import numpy as np
import pandas as pd
import joblib

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")

# Reported evaluation metrics from the paper reproduction notebook
REPORTED_METRICS = {
    "xgboost": {"r2": 83.787477, "mae": 1380.107056, "rmse": 2659.178069, "mape": 5.530829},
    "rf":      {"r2": 83.436123, "mae": 1294.929394, "rmse": 2687.837761, "mape": 5.292456},
    "gbm":     {"r2": 81.210879, "mae": 1741.845421, "rmse": 2862.696368, "mape": 6.823638},
}

MODEL_DISPLAY = {
    "xgboost": {
        "key": "xgboost",
        "name": "XGBoost Regressor",
        "description": "Highly optimised gradient-boosting implementation with regularisation.",
    },
    "gbm": {
        "key": "gbm",
        "name": "Gradient Boosting Machine",
        "description": "Sequential tree ensemble that minimises residual error at each step.",
    },
    "rf": {
        "key": "rf",
        "name": "Random Forest Regressor",
        "description": "Bagged ensemble of decision trees with averaged predictions.",
    },
}

# Feature order — must exactly match the training notebook
FEATURES = [
    "Age", "Diabetes", "BloodPressureProblems", "AnyTransplants",
    "AnyChronicDiseases", "Height", "Weight", "KnownAllergies",
    "HistoryOfCancerInFamily", "NumberOfMajorSurgeries", "BMI",
]


class Predictor:
    def __init__(self):
        self._models: dict = {}
        self._feature_names: list = FEATURES
        self._load_models()

    def _load_models(self):
        mapping = {
            "xgboost": "xgboost_model.pkl",
            "gbm":     "gbm_model.pkl",
            "rf":      "rf_model.pkl",
        }
        for key, filename in mapping.items():
            path = os.path.join(MODELS_DIR, filename)
            if os.path.exists(path):
                self._models[key] = joblib.load(path)
                print(f"  Loaded: {filename}")
            else:
                print(f"  WARNING: model file not found: {path}")

    def models_loaded(self) -> bool:
        return len(self._models) == 3

    def available_models(self) -> list:
        return list(self._models.keys())

    def model_info(self) -> list:
        result = []
        for key, info in MODEL_DISPLAY.items():
            metrics = REPORTED_METRICS.get(key, {})
            result.append({
                "key": key,
                "name": info["name"],
                "description": info["description"],
                "metrics": metrics,
                "loaded": key in self._models,
            })
        return result

    def _compute_bmi(self, height_cm: float, weight_kg: float) -> float:
        """BMI formula exactly as in the paper reproduction notebook."""
        return weight_kg / (height_cm / 100.0) ** 2

    def predict(self, model_key: str, raw_features: dict) -> dict:
        model_key = model_key.lower()
        if model_key not in self._models:
            raise ValueError(
                f"Model '{model_key}' is not loaded. "
                f"Available: {list(self._models.keys())}"
            )

        model = self._models[model_key]

        # Build input DataFrame with correct feature order
        bmi = self._compute_bmi(raw_features["Height"], raw_features["Weight"])
        input_data = {
            "Age":                     raw_features["Age"],
            "Diabetes":                raw_features["Diabetes"],
            "BloodPressureProblems":   raw_features["BloodPressureProblems"],
            "AnyTransplants":          raw_features["AnyTransplants"],
            "AnyChronicDiseases":      raw_features["AnyChronicDiseases"],
            "Height":                  raw_features["Height"],
            "Weight":                  raw_features["Weight"],
            "KnownAllergies":          raw_features["KnownAllergies"],
            "HistoryOfCancerInFamily": raw_features["HistoryOfCancerInFamily"],
            "NumberOfMajorSurgeries":  raw_features["NumberOfMajorSurgeries"],
            "BMI":                     bmi,
        }

        df = pd.DataFrame([input_data])[FEATURES]
        prediction = float(model.predict(df)[0])

        return {
            "success": True,
            "model": model_key,
            "predicted_premium": round(prediction, 2),
            "bmi": round(bmi, 4),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "input_features": raw_features,
            "disclaimer": (
                "This is a model estimate based on historical data. "
                "It is NOT an actual insurance quote or medical advice."
            ),
        }

    def get_training_data(self):
        """Load background training sample for SHAP."""
        path = os.path.join(MODELS_DIR, "training_data.pkl")
        if os.path.exists(path):
            return joblib.load(path)
        return None

    def get_model(self, key: str):
        return self._models.get(key)
