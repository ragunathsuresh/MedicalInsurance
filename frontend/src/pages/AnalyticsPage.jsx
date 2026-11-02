import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area, 
  CartesianGrid 
} from 'recharts';
import { 
  BarChart3, 
  Users, 
  DollarSign, 
  Activity, 
  TrendingUp, 
  HeartPulse, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { getAnalyticsSummary } from '../services/api';
import { formatCurrency } from '../utils/formatters';

const DEFAULT_PREMIUM_DIST = [
  { range: '< ₹18K', count: 215, label: 'Low Risk Tier' },
  { range: '₹18K - ₹24K', count: 340, label: 'Standard Tier' },
  { range: '₹24K - ₹30K', count: 260, label: 'Elevated Risk' },
  { range: '₹30K - ₹36K', count: 125, label: 'High Risk' },
  { range: '> ₹36K', count: 48, label: 'Severe Risk' },
];

const CONDITION_PREVALENCE = [
  { name: 'Blood Pressure', percent: 46.8, count: 462, fill: '#3b82f6' },
  { name: 'Diabetes', percent: 41.9, count: 414, fill: '#06b6d4' },
  { name: 'Known Allergies', percent: 21.5, count: 212, fill: '#10b981' },
  { name: 'Chronic Diseases', percent: 18.0, count: 178, fill: '#f59e0b' },
  { name: 'Family Cancer', percent: 11.7, count: 116, fill: '#a855f7' },
  { name: 'Organ Transplants', percent: 5.6, count: 55, fill: '#f43f5e' },
];

const AGE_VS_PREMIUM = [
  { age: '18-25', avgPremium: 17200, count: 180 },
  { age: '26-35', avgPremium: 21400, count: 245 },
  { age: '36-45', avgPremium: 25100, count: 270 },
  { age: '46-55', avgPremium: 28900, count: 195 },
  { age: '56-66', avgPremium: 33400, count: 98 },
];

const MODEL_SPLIT = [
  { name: 'XGBoost', value: 45, color: '#06b6d4' },
  { name: 'Random Forest', value: 35, color: '#10b981' },
  { name: 'Gradient Boosting', value: 20, color: '#3b82f6' },
];

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await getAnalyticsSummary();
        setStats(res.data || res);
      } catch (err) {
        // Fallback to dataset baseline
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-cyan-400 text-xs font-semibold mb-3">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Actuarial Intelligence & Risk Demographics</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Portfolio Risk Analytics
        </h1>
        <p className="text-slate-400 text-sm mt-1 max-w-2xl">
          Actuarial distributions across the patient population, claim risk factors, and model prediction frequencies.
        </p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Total Evaluated Profiles"
          value={stats?.totalPredictions ? stats.totalPredictions + 988 : '988+'}
          subtitle="988 Baseline + Live Records"
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="Average Annual Premium"
          value={formatCurrency(stats?.avgPremium || 24336)}
          subtitle="Indian Rupee (INR) Mean"
          icon={DollarSign}
          color="emerald"
        />
        <MetricCard
          title="Chronic Disease Burden"
          value="18.0%"
          subtitle="Prevalence in Cohort"
          icon={HeartPulse}
          color="amber"
        />
        <MetricCard
          title="High-Risk Ratio (BMI > 30)"
          value="24.6%"
          subtitle="Obese Risk Bracket"
          icon={ShieldAlert}
          color="rose"
        />
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Premium Distribution */}
        <div className="glass-card rounded-3xl p-6 sm:p-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Premium Tier Distribution</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Number of patients per annual premium price band
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-cyan-400 border border-blue-500/20 font-medium">
              INR Annual
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEFAULT_PREMIUM_DIST} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="range" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(v, name, item) => [`${v} patients (${item.payload.label})`, 'Volume']}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Age vs Premium Escalation Curve */}
        <div className="glass-card rounded-3xl p-6 sm:p-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Age vs Premium Escalation Curve</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Mean premium escalation as age advances from 18 to 66
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              +94% Gradient
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={AGE_VS_PREMIUM} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="premiumGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="age" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(v) => [`₹${v.toLocaleString()}`, 'Avg Premium']}
                />
                <Area
                  type="monotone"
                  dataKey="avgPremium"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#premiumGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Condition Prevalence */}
        <div className="glass-card rounded-3xl p-6 sm:p-8">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white">Clinical Risk Condition Prevalence</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Proportion of patients documented with specific medical conditions
            </p>
          </div>
          <div className="space-y-3.5">
            {CONDITION_PREVALENCE.map((c) => (
              <div key={c.name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-300">{c.name}</span>
                  <span className="font-bold text-white">{c.percent}% ({c.count} records)</span>
                </div>
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${c.percent}%`, backgroundColor: c.fill }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inference Model Split */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Algorithm Selection Distribution</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Breakdown of inference requests dispatched across model architectures
            </p>
          </div>

          <div className="h-52 w-full flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={MODEL_SPLIT}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {MODEL_SPLIT.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(v) => [`${v}%`, 'Usage']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center text-xs">
            {MODEL_SPLIT.map((m) => (
              <div key={m.name}>
                <span className="inline-block w-2.5 h-2.5 rounded-full mr-1.5" style={{ backgroundColor: m.color }} />
                <span className="text-slate-300 font-semibold">{m.name}</span>
                <p className="text-slate-500 text-[11px] mt-0.5">{m.value}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
