"""
explainability.py — SHAP global and local explanations
Uses the pre-trained models and training data background.
"""
import os
import numpy as np
import pandas as pd

try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False

FEATURES = [
    "Age", "Diabetes", "BloodPressureProblems", "AnyTransplants",
    "AnyChronicDiseases", "Height", "Weight", "KnownAllergies",
    "HistoryOfCancerInFamily", "NumberOfMajorSurgeries", "BMI",
]


class Explainability:
    def __init__(self, predictor):
        self._predictor = predictor
        self._global_cache: dict = {}

    def _build_explainer(self, model_key: str):
        if not SHAP_AVAILABLE:
            raise RuntimeError("SHAP is not installed.")
        model = self._predictor.get_model(model_key)
        if model is None:
            raise ValueError(f"Model '{model_key}' not loaded.")
        X_bg = self._predictor.get_training_data()
        if X_bg is None:
            raise RuntimeError("Training background data not available.")
        return shap.TreeExplainer(model), X_bg

    def global_shap(self, model_key: str = "xgboost") -> dict:
        model_key = model_key.lower()
        if model_key in self._global_cache:
            return self._global_cache[model_key]

        explainer, X_bg = self._build_explainer(model_key)
        explanation = explainer(X_bg)
        shap_values = explanation.values  # shape: [n_samples, n_features]

        mean_abs = np.abs(shap_values).mean(axis=0)
        importance = [
            {"feature": FEATURES[i], "mean_abs_shap": round(float(mean_abs[i]), 4)}
            for i in range(len(FEATURES))
        ]
        importance.sort(key=lambda x: x["mean_abs_shap"], reverse=True)

        result = {
            "model": model_key,
            "type": "global",
            "feature_importance": importance,
            "disclaimer": (
                "SHAP values explain the model's predictions based on feature contributions. "
                "They do not establish causal medical relationships."
            ),
            "note": (
                f"Based on {len(X_bg)} training samples. "
                "Larger absolute SHAP = stronger influence on predictions."
            ),
        }
        self._global_cache[model_key] = result
        return result

    def local_shap(self, model_key: str, raw_features: dict) -> dict:
        model_key = model_key.lower()
        explainer, X_bg = self._build_explainer(model_key)

        bmi = raw_features["Weight"] / (raw_features["Height"] / 100.0) ** 2
        input_data = {**raw_features, "BMI": bmi}
        df = pd.DataFrame([input_data])[FEATURES]

        explanation = explainer(df)
        shap_values = explanation.values[0]
        base_value = float(explanation.base_values[0])
        prediction = float(base_value + shap_values.sum())

        contributions = [
            {
                "feature": FEATURES[i],
                "value": round(float(df.iloc[0][FEATURES[i]]), 4),
                "shap_value": round(float(shap_values[i]), 4),
                "direction": "positive" if shap_values[i] > 0 else "negative",
            }
            for i in range(len(FEATURES))
        ]
        contributions.sort(key=lambda x: abs(x["shap_value"]), reverse=True)

        return {
            "model": model_key,
            "type": "local",
            "base_value": round(base_value, 2),
            "predicted_value": round(prediction, 2),
            "contributions": contributions,
            "disclaimer": (
                "SHAP values explain this specific prediction. "
                "They do not establish causal relationships."
            ),
        }
