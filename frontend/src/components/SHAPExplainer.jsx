import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  ReferenceLine 
} from 'recharts';
import { Layers, Sparkles, AlertCircle, Info, RefreshCw } from 'lucide-react';
import { getGlobalExplainability, getLocalExplainability } from '../services/api';
import { formatCurrency } from '../utils/formatters';

const FEATURE_READABLE_NAMES = {
  Age: 'Age',
  BMI: 'Body Mass Index (BMI)',
  NumberOfMajorSurgeries: 'Major Surgeries Count',
  AnyChronicDiseases: 'Chronic Diseases',
  AnyTransplants: 'Organ Transplants',
  Diabetes: 'Diabetes Condition',
  BloodPressureProblems: 'Blood Pressure Issues',
  HistoryOfCancerInFamily: 'Family Cancer History',
  KnownAllergies: 'Allergies',
  Weight: 'Weight (kg)',
  Height: 'Height (cm)',
};

export default function SHAPExplainer({ model = 'xgboost', patientFeatures = null }) {
  const [activeTab, setActiveTab] = useState(patientFeatures ? 'local' : 'global');
  const [localData, setLocalData] = useState(null);
  const [globalData, setGlobalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (activeTab === 'local' && patientFeatures) {
      loadLocalSHAP();
    } else if (activeTab === 'global') {
      loadGlobalSHAP();
    }
  }, [activeTab, model, patientFeatures]);

  const loadLocalSHAP = async () => {
    if (!patientFeatures) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getLocalExplainability(model === 'all' ? 'xgboost' : model, patientFeatures);
      setLocalData(res.data || res);
    } catch (err) {
      setError(err.message || 'Failed to compute local SHAP explanations');
    } finally {
      setLoading(false);
    }
  };

  const loadGlobalSHAP = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getGlobalExplainability(model === 'all' ? 'xgboost' : model);
      setGlobalData(res.data || res);
    } catch (err) {
      setError(err.message || 'Failed to retrieve global feature importances');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-400" />
            SHAP (SHapley Additive exPlanations) Engine
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Game-theoretic feature attribution breaking down model prediction logic
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
          {patientFeatures && (
            <button
              onClick={() => setActiveTab('local')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'local'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Patient-Specific Impact (Local)
            </button>
          )}
          <button
            onClick={() => setActiveTab('global')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'global'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Global Feature Importance
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-300">Evaluating TreeExplainer marginal contributions...</p>
        </div>
      ) : error ? (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{error}</span>
          </div>
          <button
            onClick={activeTab === 'local' ? loadLocalSHAP : loadGlobalSHAP}
            className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-200 hover:bg-amber-500/30 font-bold transition-colors"
          >
            Retry
          </button>
        </div>
      ) : activeTab === 'local' && localData ? (
        <div className="space-y-6">
          {/* Base Value & Prediction Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
                Dataset Base Value (E[f(x)])
              </span>
              <span className="text-2xl font-black text-slate-200 mt-1 block">
                {formatCurrency(localData.base_value)}
              </span>
              <span className="text-[10px] text-slate-500">Average historical dataset premium</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
                Patient Net Attribution
              </span>
              <span className={`text-2xl font-black mt-1 block ${
                localData.predicted_value >= localData.base_value ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {localData.predicted_value >= localData.base_value ? '+' : ''}
                {formatCurrency(localData.predicted_value - localData.base_value)}
              </span>
              <span className="text-[10px] text-slate-500">Sum of marginal feature adjustments</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
                Final Model Output (f(x))
              </span>
              <span className="text-2xl font-black text-cyan-400 mt-1 block">
                {formatCurrency(localData.predicted_value)}
              </span>
              <span className="text-[10px] text-slate-500">Specific quote for this profile</span>
            </div>
          </div>

          {/* Bar Chart of Feature Contributions */}
          <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Individual Clinical Risk Drivers on Quote
              </h4>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block shadow-[0_0_6px_#f43f5e]" /> Increases Premium
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block shadow-[0_0_6px_#10b981]" /> Lowers Premium
                </span>
              </div>
            </div>

            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={localData.contributions.map((c) => ({
                    ...c,
                    displayName: FEATURE_READABLE_NAMES[c.feature] || c.feature,
                  }))}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
                >
                  <XAxis
                    type="number"
                    stroke="#64748b"
                    fontSize={11}
                    tickFormatter={(val) => `₹${val}`}
                  />
                  <YAxis
                    type="category"
                    dataKey="displayName"
                    stroke="#94a3b8"
                    fontSize={11}
                    width={140}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                    formatter={(val) => [`₹${Number(val).toFixed(2)}`, 'SHAP Impact']}
                  />
                  <ReferenceLine x={0} stroke="#475569" strokeDasharray="3 3" />
                  <Bar dataKey="shap_value" radius={[4, 4, 4, 4]}>
                    {localData.contributions.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.shap_value >= 0 ? '#f43f5e' : '#10b981'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : activeTab === 'global' && globalData ? (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Global Feature Importance (Mean |SHAP Value|)
            </h4>
            <p className="text-xs text-slate-400">
              Across all 988 patients in the actuarial dataset, wider bars indicate features with the strongest global impact.
            </p>

            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={globalData.feature_importance.map((f) => ({
                    ...f,
                    displayName: FEATURE_READABLE_NAMES[f.feature] || f.feature,
                  }))}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
                >
                  <XAxis
                    type="number"
                    stroke="#64748b"
                    fontSize={11}
                    tickFormatter={(val) => `₹${val}`}
                  />
                  <YAxis
                    type="category"
                    dataKey="displayName"
                    stroke="#94a3b8"
                    fontSize={11}
                    width={140}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                    formatter={(val) => [`₹${Number(val).toFixed(2)}`, 'Mean |SHAP|']}
                  />
                  <Bar dataKey="mean_abs_shap" fill="#06b6d4" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-12 text-center text-xs text-slate-400">
          No explanation data loaded. Adjust patient profile to view local SHAP impact.
        </div>
      )}
    </div>
  );
}
