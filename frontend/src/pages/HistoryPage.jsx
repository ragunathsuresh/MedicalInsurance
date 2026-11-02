import React, { useState, useEffect } from 'react';
import { 
  History, 
  Trash2, 
  Download, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Eye, 
  Calendar, 
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getPredictions, deletePrediction } from '../services/api';
import { formatCurrency, formatDate, MODEL_LABELS } from '../utils/formatters';

export default function HistoryPage() {
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [modelFilter, setModelFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await getPredictions({ model: modelFilter || undefined, limit: 50 });
      const raw = res.data || [];
      const normalized = raw.map((r) => ({
        ...r,
        idKey: r.predictionId || r._id,
        model: r.model || r.modelName || 'xgboost',
        prediction: r.prediction ?? r.predictedPremium ?? 0,
        features: {
          ...(r.features || r.inputFeatures || {}),
          BMI: r.bmi ?? (r.features || r.inputFeatures || {}).BMI,
        },
      }));
      setRecords(normalized);
      setTotal(res.pagination?.total || normalized.length);
    } catch (err) {
      toast.error('Failed to load prediction history: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [modelFilter]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this prediction record?')) return;
    try {
      await deletePrediction(id);
      toast.success('Record deleted');
      setRecords((prev) => prev.filter((r) => r.idKey !== id && r._id !== id));
      if (selectedRecord?.idKey === id || selectedRecord?._id === id) setSelectedRecord(null);
    } catch (err) {
      toast.error('Failed to delete: ' + err.message);
    }
  };

  const handleExportCSV = () => {
    if (records.length === 0) {
      toast.error('No records to export');
      return;
    }
    const headers = ['ID', 'Date', 'Model', 'Prediction (INR)', 'Age', 'Height', 'Weight', 'BMI', 'Surgeries', 'ChronicDiseases', 'Diabetes', 'BP', 'Transplants'];
    const rows = records.map((r) => [
      r._id,
      new Date(r.createdAt || Date.now()).toISOString(),
      r.model,
      r.prediction,
      r.features?.Age ?? '',
      r.features?.Height ?? '',
      r.features?.Weight ?? '',
      r.features?.BMI ? r.features.BMI.toFixed(2) : '',
      r.features?.NumberOfMajorSurgeries ?? '',
      r.features?.AnyChronicDiseases ?? '',
      r.features?.Diabetes ?? '',
      r.features?.BloodPressureProblems ?? '',
      r.features?.AnyTransplants ?? '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `medical_insurance_predictions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV exported successfully!');
  };

  const filteredRecords = records.filter((r) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const modelMatch = r.model?.toLowerCase().includes(term);
    const ageMatch = String(r.features?.Age || '').includes(term);
    const priceMatch = String(r.prediction || '').includes(term);
    return modelMatch || ageMatch || priceMatch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-cyan-400 text-xs font-semibold mb-3">
            <History className="w-3.5 h-3.5" />
            <span>Audit Trail & Records</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Prediction History
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Browse and audit all previously evaluated patient premium assessments
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 text-xs font-semibold transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-3xl glass-card flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by age, premium, model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Filter by Model */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400 font-medium">Filter Model:</span>
          <select
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value)}
            className="bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-semibold"
          >
            <option value="">All Models</option>
            <option value="xgboost">XGBoost</option>
            <option value="rf">Random Forest</option>
            <option value="gbm">Gradient Boosting</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-3xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">Loading records...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-sm font-semibold text-white">No prediction records found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Run a prediction from the Predict page to start recording your evaluations.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Model</th>
                  <th className="py-3.5 px-4">Predicted Premium</th>
                  <th className="py-3.5 px-4">Age / BMI</th>
                  <th className="py-3.5 px-4">Surgeries</th>
                  <th className="py-3.5 px-4">Conditions</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredRecords.map((r) => (
                  <tr
                    key={r.idKey || r._id}
                    onClick={() => setSelectedRecord(r)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {formatDate(r.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-200 uppercase">
                        {MODEL_LABELS[r.model] || r.model}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-cyan-400 text-sm">
                        {formatCurrency(r.prediction)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {r.features?.Age} yrs ·{' '}
                      <span className="text-slate-400">
                        BMI {r.features?.BMI ? Number(r.features.BMI).toFixed(1) : '—'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {r.features?.NumberOfMajorSurgeries ?? 0}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {r.features?.AnyChronicDiseases === 1 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300">
                            Chronic
                          </span>
                        )}
                        {r.features?.Diabetes === 1 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300">
                            Diabetes
                          </span>
                        )}
                        {r.features?.BloodPressureProblems === 1 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-300">
                            BP
                          </span>
                        )}
                        {r.features?.AnyTransplants === 1 && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-600/30 text-red-200">
                            Transplant
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => handleDelete(r.idKey || r._id, e)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Prediction Details</h3>
                <p className="text-xs text-slate-400">
                  Recorded on {formatDate(selectedRecord.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-xs uppercase text-slate-400 block font-semibold">
                Predicted Premium ({MODEL_LABELS[selectedRecord.model] || selectedRecord.model})
              </span>
              <span className="text-3xl font-extrabold text-cyan-400 mt-1 block">
                {formatCurrency(selectedRecord.prediction)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Age:</span>
                <span className="text-white font-semibold ml-1.5">{selectedRecord.features?.Age} yrs</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Height:</span>
                <span className="text-white font-semibold ml-1.5">{selectedRecord.features?.Height} cm</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Weight:</span>
                <span className="text-white font-semibold ml-1.5">{selectedRecord.features?.Weight} kg</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">BMI:</span>
                <span className="text-white font-semibold ml-1.5">
                  {selectedRecord.features?.BMI ? selectedRecord.features.BMI.toFixed(2) : '—'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Major Surgeries:</span>
                <span className="text-white font-semibold ml-1.5">{selectedRecord.features?.NumberOfMajorSurgeries}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Chronic Diseases:</span>
                <span className="text-white font-semibold ml-1.5">
                  {selectedRecord.features?.AnyChronicDiseases ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Diabetes:</span>
                <span className="text-white font-semibold ml-1.5">
                  {selectedRecord.features?.Diabetes ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Blood Pressure:</span>
                <span className="text-white font-semibold ml-1.5">
                  {selectedRecord.features?.BloodPressureProblems ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
