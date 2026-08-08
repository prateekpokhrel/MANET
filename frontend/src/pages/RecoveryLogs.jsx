import React from 'react';
import { Search, FileText } from 'lucide-react';

export default function RecoveryLogs() {
  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Recovery Logs</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" placeholder="Search event ID, Node..." className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm shadow-sm outline-none focus:border-blue-500" />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {[
            { id: 'EVT-9092', node: 'Node-Beta-2', action: 'Route Optimization', status: 'Completed', time: '14:32:01' },
            { id: 'EVT-9091', node: 'Node-Alpha-7', action: 'Background Recovery', status: 'Failed', time: '14:28:11' },
          ].map((log, i) => (
            <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50">
              <div className="flex items-center gap-4">
                <FileText className="h-5 w-5 text-slate-400" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{log.action} <span className="font-normal text-slate-500 ml-2">({log.id})</span></h4>
                  <p className="text-xs text-slate-500 mt-0.5">Target: {log.node}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${log.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                  {log.status}
                </span>
                <span className="text-sm text-slate-400 font-mono">{log.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}