import os, sys, json, time, warnings
import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split, GridSearchCV, KFold
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
from xgboost import XGBRegressor

warnings.filterwarnings("ignore")
sys.stdout.reconfigure(encoding="utf-8")

CSV_PATH   = r"C:\Users\AMARNATH\Downloads\archive (4)\Medicalpremium.csv"
MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
os.makedirs(MODELS_DIR, exist_ok=True)

RANDOM_STATE = 42

TARGET = "PremiumPrice"
FEATURES = [
    "Age", "Diabetes", "BloodPressureProblems", "AnyTransplants",
    "AnyChronicDiseases", "Height", "Weight", "KnownAllergies",
    "HistoryOfCancerInFamily", "NumberOfMajorSurgeries", "BMI",
]

print("Loading dataset:", CSV_PATH)
df = pd.read_csv(CSV_PATH)
print("  Shape:", df.shape)
print("  Columns:", list(df.columns))

# BMI engineering exactly as in notebook
df["BMI"] = df["Weight"] / (df["Height"] / 100.0) ** 2
print("  BMI range: {:.2f} - {:.2f}".format(df["BMI"].min(), df["BMI"].max()))

X = df[FEATURES].copy()
y = df[TARGET].copy()

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=RANDOM_STATE
)
print("  Train: {}  Test: {}".format(X_train.shape, X_test.shape))


def evaluate(model, X_test, y_test, name):
    pred = model.predict(X_test)
    r2   = r2_score(y_test, pred) * 100
    mae  = mean_absolute_error(y_test, pred)
    rmse = float(np.sqrt(mean_squared_error(y_test, pred)))
    mape = float(np.mean(np.abs((y_test.values - pred) / y_test.values)) * 100)
    print("  {:30s}  R2={:.6f}%  MAE={:.6f}  RMSE={:.6f}  MAPE={:.6f}%".format(
        name, r2, mae, rmse, mape))
    return dict(name=name, r2=float(r2), mae=float(mae), rmse=rmse, mape=mape)


cv = KFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)

print("\n== Training XGBoost (GridSearchCV) ==")
xgb_base = XGBRegressor(objective="reg:squarederror", random_state=RANDOM_STATE, n_jobs=-1)
xgb_grid = {
    "max_depth":     list(range(2, 10, 1)),
    "n_estimators":  list(range(60, 220, 40)),
    "learning_rate": [0.1, 0.01, 0.05],
    "subsample":     [0.6, 0.7, 0.75, 0.8, 0.85, 0.9],
}
xgb_search = GridSearchCV(xgb_base, xgb_grid, scoring="r2", cv=cv, n_jobs=-1, verbose=0)
t0 = time.perf_counter()
xgb_search.fit(X_train, y_train)
print("  Done in {:.1f}s  Best: {}".format(time.perf_counter()-t0, xgb_search.best_params_))
xgb_model = xgb_search.best_estimator_
xgb_metrics = evaluate(xgb_model, X_test, y_test, "XGBoost")

print("\n== Training GBM (GridSearchCV) ==")
gbm_base = GradientBoostingRegressor(random_state=RANDOM_STATE)
gbm_grid = {
    "n_estimators":  [10, 15, 19, 20, 21, 50, 100],
    "learning_rate": [0.1, 0.19, 0.2, 0.21, 0.8, 1],
}
gbm_search = GridSearchCV(gbm_base, gbm_grid, scoring="r2", cv=cv, n_jobs=-1, verbose=0)
t0 = time.perf_counter()
gbm_search.fit(X_train, y_train)
print("  Done in {:.1f}s  Best: {}".format(time.perf_counter()-t0, gbm_search.best_params_))
gbm_model = gbm_search.best_estimator_
gbm_metrics = evaluate(gbm_model, X_test, y_test, "GBM")

print("\n== Training Random Forest (GridSearchCV) ==")
rf_base = RandomForestRegressor(random_state=RANDOM_STATE, n_jobs=-1)
rf_grid = {
    "n_estimators":      [60, 220, 40],
    "max_depth":         [7],
    "min_samples_split": [3],
    "max_features":      [1.0],
}
rf_search = GridSearchCV(rf_base, rf_grid, scoring="r2", cv=cv, n_jobs=-1, verbose=0)
t0 = time.perf_counter()
rf_search.fit(X_train, y_train)
print("  Done in {:.1f}s  Best: {}".format(time.perf_counter()-t0, rf_search.best_params_))
rf_model = rf_search.best_estimator_
rf_metrics = evaluate(rf_model, X_test, y_test, "RF")

print("\n== Saving model artifacts ==")
joblib.dump(xgb_model, os.path.join(MODELS_DIR, "xgboost_model.pkl"))
joblib.dump(gbm_model, os.path.join(MODELS_DIR, "gbm_model.pkl"))
joblib.dump(rf_model,  os.path.join(MODELS_DIR, "rf_model.pkl"))

X_train_sample = X_train.sample(min(200, len(X_train)), random_state=RANDOM_STATE)
joblib.dump(X_train_sample, os.path.join(MODELS_DIR, "training_data.pkl"))

with open(os.path.join(MODELS_DIR, "feature_names.json"), "w") as f:
    json.dump(FEATURES, f)

metadata = {
    "dataset": {
        "path": CSV_PATH,
        "total_rows": int(len(df)),
        "total_features": len(FEATURES),
        "target": TARGET,
        "train_size": int(len(X_train)),
        "test_size": int(len(X_test)),
        "random_state": RANDOM_STATE,
        "test_split": 0.25,
    },
    "features": FEATURES,
    "bmi_formula": "Weight / (Height / 100.0) ** 2",
    "models": {
        "xgboost": {"file": "xgboost_model.pkl", "best_params": {k: int(v) if isinstance(v, (np.integer,)) else float(v) if isinstance(v, (np.floating,)) else v for k, v in xgb_search.best_params_.items()}},
        "gbm":     {"file": "gbm_model.pkl",      "best_params": {k: int(v) if isinstance(v, (np.integer,)) else float(v) if isinstance(v, (np.floating,)) else v for k, v in gbm_search.best_params_.items()}},
        "rf":      {"file": "rf_model.pkl",        "best_params": {k: int(v) if isinstance(v, (np.integer,)) else float(v) if isinstance(v, (np.floating,)) else v for k, v in rf_search.best_params_.items()}},
    },
    "actual_metrics": {
        "xgboost": xgb_metrics,
        "gbm":     gbm_metrics,
        "rf":      rf_metrics,
    },
    "reported_metrics": {
        "xgboost": {"r2": 83.787477, "mae": 1380.107056, "rmse": 2659.178069, "mape": 5.530829},
        "rf":      {"r2": 83.436123, "mae": 1294.929394, "rmse": 2687.837761, "mape": 5.292456},
        "gbm":     {"r2": 81.210879, "mae": 1741.845421, "rmse": 2862.696368, "mape": 6.823638},
    }
}
with open(os.path.join(MODELS_DIR, "metadata.json"), "w") as f:
    json.dump(metadata, f, indent=2)

print("\nAll artifacts saved to:", MODELS_DIR)
for fn in os.listdir(MODELS_DIR):
    size = os.path.getsize(os.path.join(MODELS_DIR, fn))
    print("  {:35s}  {:.1f} KB".format(fn, size/1024))

print("\n== Sanity check: predict example patient ==")
example = {
    "Age": 40, "Diabetes": 0, "BloodPressureProblems": 0, "AnyTransplants": 0,
    "AnyChronicDiseases": 1, "Height": 170, "Weight": 75, "KnownAllergies": 0,
    "HistoryOfCancerInFamily": 0, "NumberOfMajorSurgeries": 1
}
ex_df = pd.DataFrame([example])
ex_df["BMI"] = ex_df["Weight"] / (ex_df["Height"] / 100.0) ** 2
ex_df = ex_df[FEATURES]

for name, model in [("XGBoost", xgb_model), ("GBM", gbm_model), ("RF", rf_model)]:
    pred = float(model.predict(ex_df)[0])
    print("  {}: Rs {:.2f}".format(name, pred))

print("\nTraining complete.")
