import React from 'react';
import { 
  Info, 
  Database, 
  Cpu, 
  ShieldCheck, 
  FileText, 
  Server, 
  ExternalLink,
  Layers,
  Sparkles,
  GitBranch
} from 'lucide-react';

const FEATURES_TABLE = [
  { name: 'Age', type: 'Integer (18–66)', desc: 'Patient age in completed years; primary linear driver of biological risk.' },
  { name: 'Diabetes', type: 'Binary (0 or 1)', desc: 'Indicates medically diagnosed Type-1 or Type-2 diabetes mellitus.' },
  { name: 'BloodPressureProblems', type: 'Binary (0 or 1)', desc: 'Chronic hypertension or hypotension requiring medical regulation.' },
  { name: 'AnyTransplants', type: 'Binary (0 or 1)', desc: 'Major solid organ recipient (kidney, liver, heart, etc.); major risk multiplier.' },
  { name: 'AnyChronicDiseases', type: 'Binary (0 or 1)', desc: 'Pre-existing chronic disorders (cardiovascular, asthma, renal disorders).' },
  { name: 'Height', type: 'Integer (145–188 cm)', desc: 'Patient height measured in centimeters.' },
  { name: 'Weight', type: 'Integer (51–132 kg)', desc: 'Patient body mass in kilograms.' },
  { name: 'BMI', type: 'Float (Engineered)', desc: 'Body Mass Index computed as Weight / (Height / 100)^2.' },
  { name: 'KnownAllergies', type: 'Binary (0 or 1)', desc: 'Documented systemic or acute medical and environmental allergies.' },
  { name: 'HistoryOfCancerInFamily', type: 'Binary (0 or 1)', desc: 'Oncological history across first-degree biological family members.' },
  { name: 'NumberOfMajorSurgeries', type: 'Integer (0–3)', desc: 'Count of major invasive surgical procedures requiring general anesthesia.' },
];

export default function AboutPage() {
  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-cyan-400 text-xs font-semibold mb-3">
          <Info className="w-3.5 h-3.5" />
          <span>System Documentation & Research Context</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          About the Medical Premium Prediction System
        </h1>
        <p className="text-slate-400 text-sm mt-1 max-w-2xl leading-relaxed">
          An end-to-end clinical machine learning actuarial platform connecting modern web engineering with state-of-the-art tree ensemble regressors and SHAP explainability.
        </p>
      </div>

      {/* Architecture Overview */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Server className="w-5 h-5 text-cyan-400" /> System Architecture
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          The application follows a decoupled microservices-inspired architecture: the client interacts with an Express.js API gateway that orchestrates data validation, persistence, and proxies prediction requests to a high-throughput Python FastAPI inference engine hosting the serialized ML pipelines.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
              1. Frontend Client
            </span>
            <p className="text-xs text-slate-300 font-semibold">React 19 + Vite + Tailwind</p>
            <p className="text-[11px] text-slate-400">
              Interactive clinical form, live BMI computation, Recharts visualizations, dark mode design system.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">
              2. API Gateway
            </span>
            <p className="text-xs text-slate-300 font-semibold">Node.js + Express + Mongoose</p>
            <p className="text-[11px] text-slate-400">
              Input validation with express-validator, audit logging, CORS/Helmet security, MongoDB storage with memory fallback.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
              3. ML Inference Service
            </span>
            <p className="text-xs text-slate-300 font-semibold">FastAPI + Scikit-Learn + XGBoost</p>
            <p className="text-[11px] text-slate-400">
              Pickled pipelines, dynamic BMI feature engineering, sub-15ms prediction latency, TreeExplainer SHAP.
            </p>
          </div>
        </div>
      </div>

      {/* Dataset Feature Dictionary */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            Dataset & Feature Dictionary (988 Patients)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Trained on the empirical medical insurance dataset covering 988 patient records with premiums denoted in Indian Rupees (INR ₹).
          </p>
        </div>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Feature Name</th>
                <th className="py-3 px-4">Data Type & Domain</th>
                <th className="py-3 px-4">Clinical Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {FEATURES_TABLE.map((f) => (
                <tr key={f.name} className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-4 font-mono font-semibold text-cyan-300">
                    {f.name}
                  </td>
                  <td className="py-2.5 px-4 text-slate-400 whitespace-nowrap">
                    {f.type}
                  </td>
                  <td className="py-2.5 px-4 text-slate-300">
                    {f.desc}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SHAP & Explainable AI Note */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          Explainable AI (SHAP) Integration
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          Black-box machine learning in healthcare carries significant risk. By pairing the gradient-boosted decision trees with <strong>SHAP TreeExplainer</strong>, every generated premium quote includes transparent marginal attributions (Shapley values) that show exactly how much each individual risk factor (e.g. +₹3,200 for family cancer history, -₹1,400 for young age) nudged the base policy price.
        </p>
      </div>
    </div>
  );
}
