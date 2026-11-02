import React, { useState } from 'react';
import { 
  HeartPulse, 
  Activity, 
  Scale, 
  Ruler, 
  AlertCircle, 
  Sparkles, 
  RotateCcw,
  Stethoscope,
  Info,
  Droplets,
  Heart,
  ShieldAlert,
  Dna,
  Zap,
  Plus,
  Minus,
  Check
} from 'lucide-react';
import { computeBMI, bmiCategory } from '../utils/formatters';

const PRESETS = [
  {
    name: 'Young & Low Risk',
    badge: 'Standard Risk',
    color: 'emerald',
    emoji: '🟢',
    data: {
      Age: 24,
      Diabetes: 0,
      BloodPressureProblems: 0,
      AnyTransplants: 0,
      AnyChronicDiseases: 0,
      Height: 172,
      Weight: 66,
      KnownAllergies: 0,
      HistoryOfCancerInFamily: 0,
      NumberOfMajorSurgeries: 0,
    },
  },
  {
    name: 'Mid-Age w/ Diabetes & BP',
    badge: 'Moderate',
    color: 'amber',
    emoji: '🟡',
    data: {
      Age: 46,
      Diabetes: 1,
      BloodPressureProblems: 1,
      AnyTransplants: 0,
      AnyChronicDiseases: 0,
      Height: 168,
      Weight: 78,
      KnownAllergies: 1,
      HistoryOfCancerInFamily: 0,
      NumberOfMajorSurgeries: 1,
    },
  },
  {
    name: 'Senior Chronic Profile',
    badge: 'High Risk',
    color: 'rose',
    emoji: '🔴',
    data: {
      Age: 62,
      Diabetes: 1,
      BloodPressureProblems: 1,
      AnyTransplants: 0,
      AnyChronicDiseases: 1,
      Height: 164,
      Weight: 84,
      KnownAllergies: 0,
      HistoryOfCancerInFamily: 1,
      NumberOfMajorSurgeries: 2,
    },
  },
  {
    name: 'Transplant Recipient',
    badge: 'Critical Tier',
    color: 'rose',
    emoji: '🟣',
    data: {
      Age: 41,
      Diabetes: 0,
      BloodPressureProblems: 1,
      AnyTransplants: 1,
      AnyChronicDiseases: 1,
      Height: 170,
      Weight: 72,
      KnownAllergies: 0,
      HistoryOfCancerInFamily: 0,
      NumberOfMajorSurgeries: 1,
    },
  },
];

const INITIAL_FORM = {
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
};

export default function PredictionForm({ onSubmit, loading, selectedModel, setSelectedModel, onFormChange }) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  const bmi = computeBMI(formData.Height, formData.Weight);
  const bmiInfo = bmiCategory(bmi);

  const handleChange = (field, value) => {
    const updated = {
      ...formData,
      [field]: Number(value),
    };
    setFormData(updated);
    if (onFormChange) onFormChange(updated);
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const incrementField = (field, step, min, max) => {
    const nextVal = Math.min(max, Math.max(min, (formData[field] || 0) + step));
    handleChange(field, nextVal);
  };

  const applyPreset = (presetData) => {
    setFormData(presetData);
    if (onFormChange) onFormChange(presetData);
    setErrors({});
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    if (onFormChange) onFormChange(INITIAL_FORM);
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};
    if (formData.Age < 18 || formData.Age > 66) {
      newErrors.Age = 'Age must be between 18 and 66 years (dataset bounds)';
    }
    if (formData.Height < 145 || formData.Height > 188) {
      newErrors.Height = 'Height must be between 145 cm and 188 cm';
    }
    if (formData.Weight < 51 || formData.Weight > 132) {
      newErrors.Weight = 'Weight must be between 51 kg and 132 kg';
    }
    if (formData.NumberOfMajorSurgeries < 0 || formData.NumberOfMajorSurgeries > 3) {
      newErrors.NumberOfMajorSurgeries = 'Surgeries must be between 0 and 3';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData, selectedModel);
  };

  // Conditions list configuration
  const clinicalConditions = [
    {
      key: 'Diabetes',
      label: 'Diabetes Mellitus',
      subtext: 'Diagnosed Type 1 or Type 2',
      icon: Droplets,
      color: 'cyan',
    },
    {
      key: 'BloodPressureProblems',
      label: 'Blood Pressure Issues',
      subtext: 'Hypertension or chronic regulation',
      icon: Activity,
      color: 'blue',
    },
    {
      key: 'AnyTransplants',
      label: 'Organ Transplant',
      subtext: 'Major solid organ recipient (high risk)',
      icon: Heart,
      color: 'rose',
    },
    {
      key: 'AnyChronicDiseases',
      label: 'Chronic Diseases',
      subtext: 'Cardiovascular, renal, or pulmonary',
      icon: ShieldAlert,
      color: 'amber',
    },
    {
      key: 'KnownAllergies',
      label: 'Known Allergies',
      subtext: 'Acute pharmaceutical or food triggers',
      icon: Sparkles,
      color: 'emerald',
    },
    {
      key: 'HistoryOfCancerInFamily',
      label: 'Family Cancer History',
      subtext: 'Immediate biological relatives oncology',
      icon: Dna,
      color: 'purple',
    },
  ];

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-8">
      {/* Top Header & Presets Bar */}
      <div className="space-y-4 pb-6 border-b border-white/[0.08]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
              <Stethoscope className="w-5 h-5 text-cyan-400" />
              Patient Actuarial & Clinical Profile
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Adjust patient parameters below or apply a reference persona to evaluate risk
            </p>
          </div>

          <button
            type="button"
            onClick={resetForm}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/80 transition-all flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Inputs</span>
          </button>
        </div>

        {/* Quick Presets Pills */}
        <div className="pt-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2.5 block">
            Quick Actuarial Personas
          </span>
          <div className="flex flex-wrap items-center gap-2.5">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => applyPreset(p.data)}
                className="group px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/60 hover:border-cyan-500/50 text-xs font-medium transition-all flex items-center gap-2 shadow-sm"
              >
                <span>{p.emoji}</span>
                <span className="font-semibold text-white group-hover:text-cyan-300">{p.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 group-hover:text-slate-300">
                  {p.badge}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Model Architecture Selector */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <label className="text-xs font-bold text-white uppercase tracking-wider block">
              Inference Algorithm
            </label>
            <p className="text-xs text-slate-400 mt-0.5">
              Select ensemble regressor or run consensus benchmark
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setSelectedModel('xgboost')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                selectedModel === 'xgboost'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              XGBoost (83.8%)
            </button>
            <button
              type="button"
              onClick={() => setSelectedModel('rf')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                selectedModel === 'rf'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Random Forest (83.4%)
            </button>
            <button
              type="button"
              onClick={() => setSelectedModel('gbm')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                selectedModel === 'gbm'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              GBM (81.2%)
            </button>
            <button
              type="button"
              onClick={() => setSelectedModel('all')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                selectedModel === 'all'
                  ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              ★ Run All 3
            </button>
          </div>
        </div>

        {/* Section 1: Demographics & Biometrics */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">
                01
              </span>
              Demographics & Anthropometrics
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Age Slider with Stepper */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/90 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                  Age (Years)
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => incrementField('Age', -1, 18, 66)}
                    className="w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold text-sm min-w-[50px] text-center">
                    {formData.Age} yr
                  </span>
                  <button
                    type="button"
                    onClick={() => incrementField('Age', 1, 18, 66)}
                    className="w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <input
                type="range"
                min="18"
                max="66"
                value={formData.Age}
                onChange={(e) => handleChange('Age', e.target.value)}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>18 yrs</span>
                <span>Dataset limit: 66 yrs</span>
              </div>
            </div>

            {/* Height Input */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/90 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-slate-400" />
                  Height (cm)
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => incrementField('Height', -1, 145, 188)}
                    className="w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm min-w-[55px] text-center">
                    {formData.Height} cm
                  </span>
                  <button
                    type="button"
                    onClick={() => incrementField('Height', 1, 145, 188)}
                    className="w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <input
                type="range"
                min="145"
                max="188"
                value={formData.Height}
                onChange={(e) => handleChange('Height', e.target.value)}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>145 cm</span>
                <span>188 cm</span>
              </div>
            </div>

            {/* Weight Input */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/90 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-slate-400" />
                  Weight (kg)
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => incrementField('Weight', -1, 51, 132)}
                    className="w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm min-w-[55px] text-center">
                    {formData.Weight} kg
                  </span>
                  <button
                    type="button"
                    onClick={() => incrementField('Weight', 1, 51, 132)}
                    className="w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <input
                type="range"
                min="51"
                max="132"
                value={formData.Weight}
                onChange={(e) => handleChange('Weight', e.target.value)}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>51 kg</span>
                <span>132 kg</span>
              </div>
            </div>
          </div>

          {/* BMI Live Feedback Gauge */}
          {bmi && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/25 flex flex-col items-center justify-center text-blue-400 font-black text-sm">
                  <span>BMI</span>
                  <span className="text-[10px] font-normal text-slate-400">kg/m²</span>
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-base font-extrabold text-white">
                      {bmi.toFixed(2)}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      bmi < 18.5
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                        : bmi < 25
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : bmi < 30
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    }`}>
                      {bmiInfo.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Derived feature fed directly into inference pipeline
                  </p>
                </div>
              </div>

              {/* Visual meter bar */}
              <div className="w-full sm:w-64 space-y-1">
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden flex">
                  <div className="h-full bg-blue-400" style={{ width: '25%' }} title="Underweight (<18.5)" />
                  <div className="h-full bg-emerald-400" style={{ width: '35%' }} title="Normal (18.5-24.9)" />
                  <div className="h-full bg-amber-400" style={{ width: '25%' }} title="Overweight (25-29.9)" />
                  <div className="h-full bg-rose-500" style={{ width: '15%' }} title="Obese (30+)" />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>18.5</span>
                  <span>25</span>
                  <span>30</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Clinical Medical Condition Toggle Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">
                02
              </span>
              Medical Conditions & Clinical History
            </h3>
            <span className="text-xs text-slate-400">Click to toggle patient status</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {clinicalConditions.map((cond) => {
              const Icon = cond.icon;
              const isSelected = formData[cond.key] === 1;
              return (
                <div
                  key={cond.key}
                  onClick={() => handleChange(cond.key, isSelected ? 0 : 1)}
                  className={`p-4 rounded-2xl border cursor-pointer select-none transition-all duration-200 flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-gradient-to-br from-cyan-950/40 via-blue-950/30 to-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-950/60 hover:bg-slate-900/80 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl border ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold leading-tight ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                        {cond.label}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 leading-snug">
                        {cond.subtext}
                      </p>
                    </div>
                  </div>

                  {/* Switch Pill */}
                  <div className={`w-11 h-6 rounded-full transition-colors flex items-center p-0.5 shrink-0 ${
                    isSelected ? 'bg-cyan-500 justify-end' : 'bg-slate-800 justify-start'
                  }`}>
                    <div className="w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center">
                      {isSelected && <Check className="w-3 h-3 text-cyan-600 stroke-[3]" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Major Surgeries Count Segmented Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">
                03
              </span>
              Major Surgical History
            </h3>
            <span className="text-xs text-slate-400">Procedures under general anesthesia</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((count) => {
              const active = formData.NumberOfMajorSurgeries === count;
              return (
                <button
                  key={count}
                  type="button"
                  onClick={() => handleChange('NumberOfMajorSurgeries', count)}
                  className={`py-3.5 px-4 rounded-2xl border text-center font-bold text-sm transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-cyan-400/80 shadow-lg shadow-cyan-500/20 scale-[1.02]'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <span className="block text-lg font-black">{count}</span>
                  <span className="text-xs font-semibold opacity-90">
                    {count === 0 ? 'No Surgeries' : count === 1 ? '1 Procedure' : `${count} Procedures`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Grand Submit CTA Button */}
        <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span>FastAPI ML engine runs feature scaling & inference pipeline</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm tracking-wide shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Computing Actuarial Pricing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-cyan-200" />
                <span>Generate Official Actuarial Quote</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
