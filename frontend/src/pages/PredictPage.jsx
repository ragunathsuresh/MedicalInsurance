import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  Zap, 
  Activity, 
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Cpu,
  HeartPulse,
  Scale
} from 'lucide-react';
import PredictionForm from '../components/PredictionForm';
import PredictionResultCard from '../components/PredictionResultCard';
import SHAPExplainer from '../components/SHAPExplainer';
import { predict } from '../services/api';
import { formatCurrency, computeBMI, bmiCategory, MODEL_LABELS } from '../utils/formatters';

export default function PredictPage() {
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('xgboost');
  const [currentResult, setCurrentResult] = useState(null);
  const [comparisonResults, setComparisonResults] = useState(null);
  const [lastSubmittedFeatures, setLastSubmittedFeatures] = useState(null);

  // Live preview state synced from form
  const [liveForm, setLiveForm] = useState({
    Age: 35,
    Diabetes: 0,
    BloodPressureProblems: 0,
    AnyTransplants: 0,
    AnyChronicDiseases: 0,
    Height: 170,
    Weight: 70,
    KnownAllergies: 0,
    HistoryOfCancerInFamily: 0,
    NumberOfMajorSurgeries: 0,
  });

  const resultsRef = useRef(null);
  const shapRef = useRef(null);

  // Live calculated BMI & heuristics
  const liveBmi = computeBMI(liveForm.Height, liveForm.Weight);
  const liveBmiCat = bmiCategory(liveBmi);

  // Count active clinical flags
  const activeFlagsCount = 
    (liveForm.Diabetes || 0) +
    (liveForm.BloodPressureProblems || 0) +
    (liveForm.AnyTransplants || 0) +
    (liveForm.AnyChronicDiseases || 0) +
    (liveForm.HistoryOfCancerInFamily || 0) +
    (liveForm.KnownAllergies || 0) +
    (liveForm.NumberOfMajorSurgeries > 0 ? 1 : 0);

  // Real-time rough actuarial heuristic bracket
  const approxBase = 15000 + (liveForm.Age * 220) + 
    ((liveForm.Diabetes || 0) * 2000) +
    ((liveForm.BloodPressureProblems || 0) * 1500) +
    ((liveForm.AnyTransplants || 0) * 6000) +
    ((liveForm.AnyChronicDiseases || 0) * 3500) +
    ((liveForm.HistoryOfCancerInFamily || 0) * 2000) +
    ((liveForm.NumberOfMajorSurgeries || 0) * 2800) +
    (liveBmi > 25 ? (liveBmi - 25) * 300 : 0);

  const approxLower = Math.round(approxBase * 0.95);
  const approxUpper = Math.round(approxBase * 1.12);

  const handlePredict = async (features, modelChoice) => {
    setLoading(true);
    setLastSubmittedFeatures(features);

    try {
      if (modelChoice === 'all') {
        const [xgbRes, rfRes, gbmRes] = await Promise.all([
          predict('xgboost', features),
          predict('rf', features),
          predict('gbm', features),
        ]);

        const compMap = {
          xgboost: xgbRes.data || xgbRes,
          rf: rfRes.data || rfRes,
          gbm: gbmRes.data || gbmRes,
        };

        setComparisonResults(compMap);
        setCurrentResult(compMap.xgboost);
        toast.success('Successfully computed predictions across all 3 models!');
      } else {
        const res = await predict(modelChoice, features);
        const data = res.data || res;
        setCurrentResult(data);
        setComparisonResults(null);
        toast.success(`Premium quote computed with ${(data.model || modelChoice).toUpperCase()}!`);
      }

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      toast.error(err.message || 'Failed to generate prediction');
    } finally {
      setLoading(false);
    }
  };

  const handleExplainClick = () => {
    shapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-10">
      {/* Hero Banner with Modern Ambient Glow */}
      <div className="relative rounded-3xl overflow-hidden glass-card p-8 sm:p-12 border-cyan-500/20 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-500/10 via-blue-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Healthcare Actuarial Intelligence & ML Pricing</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.15]">
            Precision Health Insurance <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300">
              Premium Prediction Engine
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
            Evaluate annual medical insurance pricing in Indian Rupees (INR ₹) using validated tree ensemble regressors trained on 988 patient records with 83.4%+ R² accuracy and SHAP explainability.
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-semibold text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
              <span>XGBoost (83.8% R²)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              <span>Random Forest (₹1,295 MAE)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]" />
              <span>Gradient Boosting (81.2% R²)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form and Real-time Right Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: 7 cols */}
        <div className="lg:col-span-7">
          <PredictionForm
            onSubmit={handlePredict}
            loading={loading}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            onFormChange={(data) => setLiveForm(data)}
          />
        </div>

        {/* Right Panel: 5 cols */}
        <div className="lg:col-span-5 space-y-6">
          <div ref={resultsRef}>
            {currentResult ? (
              <PredictionResultCard
                result={currentResult}
                comparisonResults={comparisonResults}
                onExplainClick={handleExplainClick}
              />
            ) : (
              /* Live Real-time Interactive Preview Card */
              <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 border-slate-700/80">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-cyan-400 flex items-center justify-center">
                      <Activity className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                        Live Actuarial Preview
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Dynamic telemetry computed from input adjustments
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                    REALTIME
                  </span>
                </div>

                {/* Approximate Expected Bracket */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Expected Policy Premium Bracket
                  </span>
                  <div className="text-3xl font-extrabold text-white tracking-tight">
                    {formatCurrency(approxLower)} – {formatCurrency(approxUpper)}
                  </div>
                  <p className="text-xs text-slate-400 pt-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Click "Generate Official Actuarial Quote" for exact model score</span>
                  </p>
                </div>

                {/* Patient Summary Indicators */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                    <span className="text-slate-400 block font-medium">Risk Flags Detected</span>
                    <span className="text-base font-bold text-white">
                      {activeFlagsCount} Active {activeFlagsCount === 1 ? 'Condition' : 'Conditions'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                    <span className="text-slate-400 block font-medium">Computed BMI</span>
                    <span className="text-base font-bold text-cyan-300">
                      {liveBmi ? liveBmi.toFixed(1) : '—'} ({liveBmiCat.label})
                    </span>
                  </div>
                </div>

                {/* Selected Model Spec Info */}
                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs text-slate-300 space-y-2">
                  <div className="flex justify-between items-center font-bold text-white">
                    <span className="flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-cyan-400" />
                      Active Algorithm:
                    </span>
                    <span className="text-cyan-300 uppercase">
                      {MODEL_LABELS[selectedModel] || selectedModel}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Mean Absolute Error (MAE):</span>
                    <span className="text-white font-semibold">
                      {selectedModel === 'rf' ? '₹1,295' : selectedModel === 'gbm' ? '₹1,742' : '₹1,380'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>R² Variance Explained:</span>
                    <span className="text-emerald-400 font-semibold">
                      {selectedModel === 'rf' ? '83.44%' : selectedModel === 'gbm' ? '81.21%' : '83.79%'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SHAP Explainability Section */}
      <div ref={shapRef} className="pt-4">
        <SHAPExplainer
          model={currentResult?.model || selectedModel}
          patientFeatures={lastSubmittedFeatures || liveForm}
        />
      </div>
    </div>
  );
}
