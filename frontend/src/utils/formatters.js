// src/utils/formatters.js
export const formatCurrency = (amount) => {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (n, decimals = 2) => {
  if (n == null) return '—';
  return Number(n).toFixed(decimals);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const computeBMI = (height, weight) => {
  if (!height || !weight || height <= 0) return null;
  return weight / Math.pow(height / 100, 2);
};

export const bmiCategory = (bmi) => {
  if (bmi == null) return { label: '—', color: 'text-slate-500' };
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-500' };
  if (bmi < 25)   return { label: 'Normal',      color: 'text-green-600' };
  if (bmi < 30)   return { label: 'Overweight',  color: 'text-amber-500' };
  return           { label: 'Obese',             color: 'text-red-500' };
};

export const MODEL_LABELS = {
  xgboost: 'XGBoost',
  gbm:     'Gradient Boosting',
  rf:      'Random Forest',
};

export const MODEL_REPORTED_METRICS = {
  xgboost: { r2: 83.787477, mae: 1380.107056, rmse: 2659.178069, mape: 5.530829 },
  rf:      { r2: 83.436123, mae: 1294.929394, rmse: 2687.837761, mape: 5.292456 },
  gbm:     { r2: 81.210879, mae: 1741.845421, rmse: 2862.696368, mape: 6.823638 },
};

export const PAPER_METRICS = {
  xgboost: { r2: 86.470, mae: 1442.904, rmse: 2231.524, mape: 5.906 },
  gbm:     { r2: 84.720, mae: 1725.859, rmse: 2371.412, mape: 7.229 },
  rf:      { r2: 84.046, mae: 1379.960, rmse: 2423.161, mape: 5.831 },
};
