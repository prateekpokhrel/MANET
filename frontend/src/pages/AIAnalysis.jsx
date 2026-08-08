import React from 'react';
import { BrainCircuit, TrendingUp, AlertTriangle } from 'lucide-react';

export default function AIAnalysis() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Diagnostic Analysis</h1>
        <p className="text-sm text-slate-500 mt-1">Performance metrics for predictive routing and anomaly detection.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <BrainCircuit className="h-5 w-5 text-indigo-500" />
            <h3 className="font-semibold text-slate-700">Model Confidence</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900">94.2%</p>
          <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> +1.2% since retraining</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h3 className="font-semibold text-slate-700">False Positive Rate</h3>
          </div>
          <p className="text-3xl font-bold text-slate-900">1.8%</p>
          <p className="text-xs text-slate-500 mt-2">Target threshold &lt; 2.0%</p>
        </div>
      </div>
      
      {/* Chart Placeholder Area */}
      <div className="bg-white h-80 rounded-xl border border-slate-200 shadow-sm flex items-center justify-center">
         <p className="text-slate-400 font-medium border border-dashed border-slate-300 px-6 py-3 rounded-lg bg-slate-50">Insert Recharts / Chart.js Line Chart Here (Anomaly Trends)</p>
      </div>
    </div>
  );
}