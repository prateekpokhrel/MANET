import React, { useState, useEffect } from 'react';
import { Activity, Wifi, Cpu, Battery, AlertCircle, CheckCircle2, ServerCrash, ShieldAlert, ChevronRight } from 'lucide-react';

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    battery: 84.2, cpu: 42.5, rssi: -62, packetLoss: 0.82
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setMetrics(prev => ({
        battery: Math.max(0, prev.battery - 0.01),
        cpu: Math.min(100, Math.max(0, prev.cpu + (Math.random() * 2 - 1))),
        rssi: -62 + Math.floor(Math.random() * 3 - 1),
        packetLoss: Math.max(0, prev.packetLoss + (Math.random() * 0.1 - 0.05))
      }));
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard title="Avg Battery Life" value={`${metrics.battery.toFixed(1)}%`} icon={Battery} trend="-0.1% / hr" isGood={true} progress={metrics.battery} color="blue" />
        <MetricCard title="Network CPU Load" value={`${metrics.cpu.toFixed(1)}%`} icon={Cpu} trend="+1.2% / hr" isGood={true} progress={metrics.cpu} color="emerald" />
        <MetricCard title="Avg RSSI" value={`${metrics.rssi} dBm`} icon={Wifi} trend="Stable" isGood={true} progress={metrics.rssi + 100} color="indigo" />
        <MetricCard title="Packet Loss" value={`${metrics.packetLoss.toFixed(2)}%`} icon={Activity} trend="+0.3% spike" isGood={false} progress={metrics.packetLoss * 20} color="rose" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 flex flex-col">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-xl">
              <div>
                <h2 className="text-base font-semibold text-slate-800">AI Failure Prediction & Alerts</h2>
                <p className="text-sm text-slate-500">Real-time fault classification and routing decisions.</p>
              </div>
              <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">View All Logs</button>
            </div>
            
            <div className="p-0">
              <div className="px-6 py-4 border-b border-slate-100 hover:bg-slate-50 transition-colors flex items-start gap-4">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg shrink-0 mt-1"><AlertCircle className="h-5 w-5" /></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-900 text-sm">Node-Alpha-7</h4>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">Congestion</span>
                    </div>
                    <span className="text-xs text-slate-400">2 mins ago</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">Network traffic spike detected. Predicting link saturation within 4 minutes.</p>
                  <div className="flex items-center justify-between bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-2 text-sm text-blue-800">
                      <Activity className="h-4 w-4" /><span>Action: Traffic Migration & Route Optimization in progress...</span>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-blue-100 text-blue-700">AI Self-Healing</span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 hover:bg-slate-50 transition-colors flex items-start gap-4">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-lg shrink-0 mt-1"><ServerCrash className="h-5 w-5" /></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-900 text-sm">Node-Delta-3</h4>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">Hardware</span>
                    </div>
                    <span className="text-xs text-slate-400">15 mins ago</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">Power supply failure or critical sensor disconnect detected.</p>
                  <div className="flex items-center justify-between bg-rose-50/50 p-2.5 rounded-lg border border-rose-100">
                    <div className="flex items-center gap-2 text-sm text-rose-800">
                      <ShieldAlert className="h-4 w-4" /><span>Action: AI cannot recover. Manual node replacement required.</span>
                    </div>
                    <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-sm">
                      Notify Operator <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-1 flex flex-col">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
              <h2 className="text-base font-semibold text-slate-800">Self-Healing Pipeline</h2>
              <p className="text-sm text-slate-500">Recent autonomous recovery events.</p>
            </div>
            
            <div className="p-6">
              <div className="relative space-y-0 before:absolute before:inset-0 before:left-[35px] before:w-[2px] before:bg-slate-100 before:h-[calc(100%-2rem)] before:mt-4">
                <PipelineItem time="14:32:01" event="Node Reintegration" desc="Node-Beta-2 successfully rejoined mesh." isLast={false} status="success" />
                <PipelineItem time="14:31:45" event="Health Verification" desc="Node-Beta-2 passed all diagnostic checks." isLast={false} status="completed" />
                <PipelineItem time="14:30:12" event="Background Recovery" desc="AI restarted routing daemon on Node-Beta-2." isLast={false} status="completed" />
                <PipelineItem time="14:29:45" event="Traffic Migration" desc="Traffic seamlessly migrated via Alt-Route-B." isLast={false} status="completed" />
                <PipelineItem time="14:29:40" event="Fault Prediction" desc="Software fault detected. Healing initiated." isLast={true} status="completed" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---
function MetricCard({ title, value, icon: Icon, trend, isGood, progress, color }) {
  const colorMap = { blue: 'bg-blue-600', emerald: 'bg-emerald-500', indigo: 'bg-indigo-500', rose: 'bg-rose-500' };
  return (
    <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
        </div>
        <div className="p-2 bg-slate-50 rounded-lg border border-slate-100"><Icon className="h-5 w-5 text-slate-400" /></div>
      </div>
      <div className="flex items-center justify-between gap-4 mt-4">
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full ${colorMap[color]} rounded-full transition-all duration-700 ease-out`} style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
        </div>
        <span className={`text-xs font-medium ${isGood ? 'text-emerald-600' : 'text-rose-600'}`}>{trend}</span>
      </div>
    </div>
  );
}

function PipelineItem({ time, event, desc, isLast, status }) {
  return (
    <div className={`relative flex gap-4 ${!isLast ? 'pb-6' : ''}`}>
      <div className="flex flex-col items-center mt-0.5 shrink-0 z-10">
        <div className={`h-6 w-6 rounded-full flex items-center justify-center border-2 bg-white ${status === 'success' ? 'border-emerald-500 text-emerald-500' : 'border-slate-300 text-slate-400'}`}>
          {status === 'success' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />}
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <h4 className={`text-sm font-semibold ${status === 'success' ? 'text-slate-900' : 'text-slate-700'}`}>{event}</h4>
          <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{time}</span>
        </div>
        <p className="text-sm text-slate-500 leading-snug">{desc}</p>
      </div>
    </div>
  );
}