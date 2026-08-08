import React from 'react';
import { ShieldCheck, Clock, Activity } from 'lucide-react';

export default function Recoverability() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Recoverability Metrics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm flex items-start gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Clock className="h-6 w-6" /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Mean Time To Recovery (MTTR)</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">1.2s</p>
            <p className="text-xs text-slate-400 mt-1">Average time for AI to reroute traffic post-failure.</p>
          </div>
        </div>

        <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm flex items-start gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><ShieldCheck className="h-6 w-6" /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Autonomous Success Rate</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">87.5%</p>
            <p className="text-xs text-slate-400 mt-1">Issues resolved without human intervention.</p>
          </div>
        </div>
      </div>
    </div>
  );
}