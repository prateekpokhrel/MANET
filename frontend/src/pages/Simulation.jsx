import React from 'react';
import { Play, Square, Settings2, RefreshCw } from 'lucide-react';

export default function Simulation() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Environment Simulation</h1>
          <p className="text-sm text-slate-500 mt-1">Configure and execute MANET traffic scenarios.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-rose-600 rounded-lg text-sm font-semibold hover:bg-rose-50 transition-colors shadow-sm">
            <Square className="h-4 w-4" /> Stop Sim
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
            <Play className="h-4 w-4" /> Start Simulation
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Config Panel */}
        <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
            <Settings2 className="h-5 w-5 text-slate-500" />
            <h2 className="text-lg font-semibold text-slate-800">Global Parameters</h2>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Total Node Count</label>
              <input type="range" min="10" max="200" className="w-full accent-blue-600" />
              <div className="flex justify-between text-xs text-slate-500 mt-1"><span>10</span><span>200</span></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Mobility Model</label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500">
                <option>Random Waypoint</option>
                <option>Gauss-Markov</option>
                <option>Manhattan Grid</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Traffic Generation Rate (Pkts/s)</label>
              <input type="number" defaultValue={500} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
            </div>
          </div>
        </div>

        {/* Live Status */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Runtime Engine</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-sm font-medium text-slate-600">Status</span>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-bold flex items-center gap-1.5"><RefreshCw className="h-3 w-3 animate-spin" /> RUNNING</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-sm font-medium text-slate-600">Sim Time</span>
              <span className="text-sm text-slate-900 font-mono">02:14:45</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}