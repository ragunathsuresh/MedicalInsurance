import React from 'react';
import { ShieldCheck, Heart, Sparkles, Database, GitBranch } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#060913] border-t border-white/[0.08] text-slate-400 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-cyan-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-white font-extrabold text-lg tracking-tight">MedPremium AI</span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Enterprise clinical actuarial underwriting platform using Extreme Gradient Boosting (XGBoost), Random Forest, and Gradient Boosting regressors with SHAP explainability.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
                <Database className="w-3.5 h-3.5 text-cyan-400" /> 988 Patient Records
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> SHAP TreeExplainer
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
                <GitBranch className="w-3.5 h-3.5 text-emerald-400" /> MERN + FastAPI
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Architecture</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>Frontend: React 19 + Tailwind v4</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span>API Gateway: Express & Node.js</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>ML Engine: FastAPI & XGBoost</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                <span>Storage: MongoDB (with fallback)</span>
              </li>
            </ul>
          </div>

          {/* Benchmark summary */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Empirical Accuracy</h4>
            <div className="space-y-2.5 text-xs">
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between font-bold text-white mb-1">
                  <span>Random Forest</span>
                  <span className="text-emerald-400">83.44% R²</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>MAE: ₹1,295</span>
                  <span>RMSE: ₹2,688</span>
                </div>
              </div>
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between font-bold text-white mb-1">
                  <span>XGBoost Regressor</span>
                  <span className="text-cyan-400">83.79% R²</span>
                </div>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>MAE: ₹1,380</span>
                  <span>RMSE: ₹2,659</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} MedPremium AI. Designed for actuarial modeling and clinical research.</p>
          <div className="flex items-center gap-1.5">
            <span>Built with precision for healthcare decision support</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline ml-1" />
          </div>
        </div>
      </div>
    </footer>
  );
}
