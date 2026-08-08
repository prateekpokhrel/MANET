import React from 'react';
import { Filter, Download } from 'lucide-react';

export default function Node() {
  const node = [
    { id: 'Node-Alpha-1', ip: '10.0.0.1', status: 'Online', battery: '89%', rssi: '-55 dBm', role: 'Gateway' },
    { id: 'Node-Beta-2', ip: '10.0.0.2', status: 'Warning', battery: '32%', rssi: '-78 dBm', role: 'Relay' },
    { id: 'Node-Delta-3', ip: '10.0.0.3', status: 'Offline', battery: '0%', rssi: 'N/A', role: 'Endpoint' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Node Inventory</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time status of all registered MANET endpoints.</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 shadow-sm"><Filter className="h-4 w-4" /></button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
              <th className="p-4">Node ID</th>
              <th className="p-4">IP Address</th>
              <th className="p-4">Role</th>
              <th className="p-4">Battery</th>
              <th className="p-4">Signal (RSSI)</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm text-slate-700 divide-y divide-slate-100">
            {node.map((node, i) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-medium text-slate-900">{node.id}</td>
                <td className="p-4 font-mono text-slate-500">{node.ip}</td>
                <td className="p-4">{node.role}</td>
                <td className="p-4">{node.battery}</td>
                <td className="p-4">{node.rssi}</td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    node.status === 'Online' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                    node.status === 'Warning' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                    'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {node.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}