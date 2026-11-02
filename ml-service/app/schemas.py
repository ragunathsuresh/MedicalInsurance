"""
schemas.py — Pydantic models for the ML service API
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime


class InputFeatures(BaseModel):
    Age: int = Field(..., ge=18, le=100, description="Age in years (18-100)")
    Diabetes: int = Field(..., ge=0, le=1, description="0 = No, 1 = Yes")
    BloodPressureProblems: int = Field(..., ge=0, le=1)
    AnyTransplants: int = Field(..., ge=0, le=1)
    AnyChronicDiseases: int = Field(..., ge=0, le=1)
    Height: float = Field(..., ge=100, le=250, description="Height in centimetres")
    Weight: float = Field(..., ge=30, le=300, description="Weight in kilograms")
    KnownAllergies: int = Field(..., ge=0, le=1)
    HistoryOfCancerInFamily: int = Field(..., ge=0, le=1)
    NumberOfMajorSurgeries: int = Field(..., ge=0, le=20)

    @field_validator("Diabetes", "BloodPressureProblems", "AnyTransplants",
                     "AnyChronicDiseases", "KnownAllergies", "HistoryOfCancerInFamily")
    @classmethod
    def validate_binary(cls, v):
        if v not in (0, 1):
            raise ValueError("Must be 0 or 1")
        return v


class PredictionRequest(BaseModel):
    model: str = Field(..., description="One of: xgboost, gbm, rf")
    features: InputFeatures

    @field_validator("model")
    @classmethod
    def validate_model(cls, v):
        allowed = {"xgboost", "gbm", "rf"}
        if v.lower() not in allowed:
            raise ValueError(f"model must be one of {allowed}")
        return v.lower()


class PredictionResponse(BaseModel):
    success: bool
    model: str
    predicted_premium: float
    bmi: float
    timestamp: str
    input_features: dict
    disclaimer: str = (
        "This is a model estimate based on historical data. "
        "It is NOT an actual insurance quote or medical advice."
    )


class ModelMetrics(BaseModel):
    r2: float
    mae: float
    rmse: float
    mape: float


class ModelInfo(BaseModel):
    key: str
    name: str
    description: str
    metrics: ModelMetrics
    loaded: bool


class ModelsResponse(BaseModel):
    models: list[ModelInfo]


class HealthResponse(BaseModel):
    status: str
    models_loaded: bool
    available_models: list[str]
