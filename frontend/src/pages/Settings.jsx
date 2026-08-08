import React from 'react';
import { Save } from 'lucide-react';

export default function Settings() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
          <Save className="h-4 w-4" /> Save Configuration
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-8">
        {/* Section 1 */}
        <section>
          <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2">AI Thresholds</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Max Retries before Operator Alert</label>
              <input type="number" defaultValue={3} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Anomaly Confidence Cutoff</label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500">
                <option>Aggressive (&gt; 70%)</option>
                <option selected>Standard (&gt; 85%)</option>
                <option>Conservative (&gt; 95%)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section>
          <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2">Notifications</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4" />
              <span className="text-sm text-slate-700">Email alerts for Critical Hardware Faults</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4" />
              <span className="text-sm text-slate-700">Daily routing optimization reports</span>
            </label>
          </div>
        </section>
      </div>
    </div>
  );
}