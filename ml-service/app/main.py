"""
main.py — FastAPI ML Inference Service
Serves predictions from pre-trained XGBoost, GBM, and Random Forest models.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.predictor import Predictor
from app.schemas import PredictionRequest, PredictionResponse, ModelsResponse, HealthResponse
from app.explainability import Explainability

app = FastAPI(
    title="Medical Insurance Premium ML Service",
    description="Serves predictions from pre-trained ensemble regression models.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load models once at startup
predictor = Predictor()
explainability = Explainability(predictor)


@app.get("/health", response_model=HealthResponse)
def health():
    return {
        "status": "ok",
        "models_loaded": predictor.models_loaded(),
        "available_models": predictor.available_models(),
    }


@app.get("/models", response_model=ModelsResponse)
def get_models():
    return {"models": predictor.model_info()}


@app.post("/predict", response_model=PredictionResponse)
def predict(req: PredictionRequest):
    try:
        result = predictor.predict(req.model, req.features.model_dump())
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.get("/explain/global")
def explain_global(model: str = "xgboost"):
    try:
        return explainability.global_shap(model)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/explain/local")
def explain_local(req: PredictionRequest):
    try:
        return explainability.local_shap(req.model, req.features.model_dump())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
