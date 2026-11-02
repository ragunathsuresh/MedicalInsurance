import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  Activity, 
  Cpu, 
  History, 
  BarChart3, 
  Info, 
  ShieldCheck, 
  Menu, 
  X,
  Server,
  Sparkles
} from 'lucide-react';
import { getHealth } from '../services/api';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [systemStatus, setSystemStatus] = useState({ backend: 'checking', mlService: 'checking' });

  useEffect(() => {
    let mounted = true;
    const checkStatus = async () => {
      try {
        const res = await getHealth();
        if (mounted) {
          const mlOnline = res?.mlService?.available || res?.mlService?.status === 'ok';
          setSystemStatus({
            backend: res?.status === 'ok' ? 'online' : 'degraded',
            mlService: mlOnline ? 'online' : 'offline',
          });
        }
      } catch (err) {
        if (mounted) {
          setSystemStatus({ backend: 'offline', mlService: 'offline' });
        }
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const navItems = [
    { to: '/', label: 'Predict Premium', icon: Activity },
    { to: '/compare', label: 'Model Benchmark', icon: Cpu },
    { to: '/history', label: 'Prediction History', icon: History },
    { to: '/analytics', label: 'Risk Analytics', icon: BarChart3 },
    { to: '/about', label: 'About & Dataset', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#080c17]/85 backdrop-blur-xl border-b border-white/[0.08] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:scale-105 group-hover:shadow-cyan-500/40 transition-all duration-300">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-white font-sans">
                  MedPremium
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-semibold tracking-wide">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide">
                ML Actuarial Intelligence Suite
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                      isActive
                        ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Right Status Indicator Badge */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs shadow-inner">
              <Server className="w-4 h-4 text-slate-400" />
              <span className="text-slate-400 font-medium">ML Service:</span>
              <span className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    systemStatus.mlService === 'online'
                      ? 'bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse'
                      : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
                  }`}
                />
                <span className={`font-semibold capitalize ${
                  systemStatus.mlService === 'online' ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {systemStatus.mlService}
                </span>
              </span>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#0b1120] px-4 pt-3 pb-5 space-y-1.5 animate-fadeIn">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 px-3">
            <span>FastAPI ML Status</span>
            <span className={`capitalize font-bold ${
              systemStatus.mlService === 'online' ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {systemStatus.mlService}
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
