import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { 
  Cpu, 
  Award, 
  CheckCircle2, 
  TrendingUp, 
  AlertCircle, 
  Play, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { predict } from '../services/api';
import { formatCurrency, MODEL_REPORTED_METRICS, PAPER_METRICS } from '../utils/formatters';

const MODEL_DETAILS = [
  {
    id: 'xgboost',
    name: 'XGBoost Regressor',
    tag: 'Highest Reported R²',
    color: '#06b6d4',
    badge: 'Gradient Boosted Trees',
    r2: 83.79,
    mae: 1380,
    rmse: 2659,
    mape: 5.53,
    description:
      'Extreme Gradient Boosting using second-order Taylor expansion gradients with L1/L2 regularization to prevent overfitting on complex risk interactions.',
    pros: ['Excellent handling of non-linear risk interactions', 'Regularized objective reduces variance', 'Fast parallel tree pruning'],
  },
  {
    id: 'rf',
    name: 'Random Forest Regressor',
    tag: 'Lowest MAE (Best Generalization)',
    color: '#10b981',
    badge: 'Bootstrap Aggregated Ensemble',
    r2: 83.44,
    mae: 1295,
    rmse: 2688,
    mape: 5.29,
    description:
      'Ensemble of 100 decorrelated decision trees built on bootstrap subsets. Achieved the lowest absolute deviation (MAE = ₹1,295) across all benchmarks.',
    pros: ['Resistant to outlier anomalies in patient claims', 'Lowest Mean Absolute Error', 'Robust feature importance ranking'],
  },
  {
    id: 'gbm',
    name: 'Gradient Boosting (GBM)',
    tag: 'Classic Sequential Ensemble',
    color: '#3b82f6',
    badge: 'Sequential Boosting',
    r2: 81.21,
    mae: 1742,
    rmse: 2863,
    mape: 6.82,
    description:
      'Standard gradient-boosted trees minimizing squared loss sequentially. Provides stable baseline performance matching classic literature.',
    pros: ['Smooth loss function convergence', 'Strong baseline benchmark', 'High fidelity gradient optimization'],
  },
];

export default function CompareModelsPage() {
  const [testPatient, setTestPatient] = useState({
    Age: 42,
    Diabetes: 1,
    BloodPressureProblems: 1,
    AnyTransplants: 0,
    AnyChronicDiseases: 1,
    Height: 168,
    Weight: 80,
    KnownAllergies: 0,
    HistoryOfCancerInFamily: 0,
    NumberOfMajorSurgeries: 1,
  });

  const [simResults, setSimResults] = useState(null);
  const [simLoading, setSimLoading] = useState(false);

  const runSimulation = async () => {
    setSimLoading(true);
    try {
      const [xgb, rf, gbm] = await Promise.all([
        predict('xgboost', testPatient),
        predict('rf', testPatient),
        predict('gbm', testPatient),
      ]);
      setSimResults({
        xgboost: xgb.data || xgb,
        rf: rf.data || rf,
        gbm: gbm.data || gbm,
      });
      toast.success('Simulation completed for all 3 models!');
    } catch (err) {
      toast.error('Simulation failed: ' + err.message);
    } finally {
      setSimLoading(false);
    }
  };

  const chartDataR2 = [
    { name: 'XGBoost', trained: 83.79, paper: 86.47 },
    { name: 'Random Forest', trained: 83.44, paper: 84.05 },
    { name: 'GBM', trained: 81.21, paper: 84.72 },
  ];

  const chartDataErrors = [
    { name: 'XGBoost', mae: 1380, rmse: 2659 },
    { name: 'Random Forest', mae: 1295, rmse: 2688 },
    { name: 'GBM', mae: 1742, rmse: 2863 },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-cyan-400 text-xs font-semibold mb-3">
          <Cpu className="w-3.5 h-3.5" />
          <span>Algorithmic Comparison & Benchmarks</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Machine Learning Model Benchmark
        </h1>
        <p className="text-slate-400 text-sm mt-1 max-w-2xl">
          Side-by-side comparative analysis of the trained regressors on the medical insurance dataset: R² variance explained, Mean Absolute Error, and prediction behavior.
        </p>
      </div>

      {/* Model Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {MODEL_DETAILS.map((m) => (
          <div
            key={m.id}
            className="glass-card glass-card-hover rounded-3xl p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-xs px-3 py-1 rounded-full bg-slate-900 text-cyan-300 border border-slate-700/80 font-bold">
                  {m.badge}
                </span>
                <span className="text-xs font-bold text-emerald-400">
                  {m.tag}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-white">{m.name}</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {m.description}
                </p>
              </div>

              {/* Metrics grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    R² Accuracy
                  </span>
                  <span className="text-xl font-black text-emerald-400 mt-0.5 block">
                    {m.r2.toFixed(2)}%
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Mean Abs Error
                  </span>
                  <span className="text-xl font-black text-cyan-400 mt-0.5 block">
                    {formatCurrency(m.mae)}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    RMSE
                  </span>
                  <span className="text-lg font-black text-slate-200 mt-0.5 block">
                    {formatCurrency(m.rmse)}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    MAPE
                  </span>
                  <span className="text-lg font-black text-slate-200 mt-0.5 block">
                    {m.mape.toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Pros */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                  Key Strengths
                </span>
                {m.pros.map((pro, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{pro}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Visual Benchmark Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* R2 Comparison */}
        <div className="glass-card rounded-3xl p-6 sm:p-8">
          <h3 className="text-base font-bold text-white mb-1">
            R² Variance Explained (%)
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Comparison between current trained models and reference published benchmarks (higher is better)
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartDataR2} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} domain={[75, 90]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(v) => [`${v}%`]}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="trained" name="Trained Model R²" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="paper" name="Paper Published R²" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Error Comparison */}
        <div className="glass-card rounded-3xl p-6 sm:p-8">
          <h3 className="text-base font-bold text-white mb-1">
            Error Metrics: MAE & RMSE (₹)
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Mean Absolute Error and Root Mean Squared Error in Indian Rupees (lower is better)
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartDataErrors} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(v) => [`₹${v}`, 'Error']}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="mae" name="Mean Absolute Error (MAE)" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="rmse" name="Root Mean Squared Error (RMSE)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Live Parallel Simulator */}
      <div className="glass-card rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Play className="w-5 h-5 text-emerald-400" />
              Live Multi-Model Inference Simulator
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Dispatch a test patient profile across all 3 models concurrently to observe price spread & consensus
            </p>
          </div>
          <button
            onClick={runSimulation}
            disabled={simLoading}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {simLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Running Simulator...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run Parallel Benchmark</span>
              </>
            )}
          </button>
        </div>

        {/* Profile Details */}
        <div className="py-4 flex flex-wrap gap-2 text-xs text-slate-300">
          <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800">
            Age: <strong>{testPatient.Age} yrs</strong>
          </span>
          <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800">
            BMI: <strong>{(testPatient.Weight / Math.pow(testPatient.Height / 100, 2)).toFixed(1)}</strong>
          </span>
          <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800">
            Diabetes: <strong>Yes</strong>
          </span>
          <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800">
            Blood Pressure: <strong>Yes</strong>
          </span>
          <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800">
            Chronic Disease: <strong>Yes</strong>
          </span>
          <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800">
            Surgeries: <strong>1</strong>
          </span>
        </div>

        {/* Simulation Output Cards */}
        {simResults ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {Object.entries(simResults).map(([key, res]) => {
              const val = res.prediction ?? res.predicted_premium ?? 0;
              const avg =
                ((simResults.xgboost?.prediction ?? simResults.xgboost?.predicted_premium ?? 0) +
                 (simResults.rf?.prediction ?? simResults.rf?.predicted_premium ?? 0) +
                 (simResults.gbm?.prediction ?? simResults.gbm?.predicted_premium ?? 0)) / 3;
              return (
                <div key={key} className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs font-semibold uppercase text-slate-400 block mb-1">
                    {key.toUpperCase()}
                  </span>
                  <span className="text-2xl font-bold text-white block">
                    {formatCurrency(val)}
                  </span>
                  <div className="flex justify-between items-center text-xs text-slate-400 mt-3 pt-2 border-t border-slate-800">
                    <span>Delta vs Avg:</span>
                    <span className="text-cyan-400 font-semibold">
                      {val >= avg ? '+' : ''}{formatCurrency(val - avg)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-500">
            Click "Run Parallel Benchmark" above to test consensus pricing across all 3 architectures.
          </div>
        )}
      </div>
    </div>
  );
}
