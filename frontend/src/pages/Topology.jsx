import React, { useState, useEffect } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Radio, 
  Server, 
  Smartphone, 
  Activity, 
  Battery, 
  Cpu, 
  Wifi, 
  X,
  Settings2
} from 'lucide-react';

// --- MOCK MESH NETWORK DATA ---
const INITIAL_NODES = [
  { id: 'gw-1', x: 400, y: 300, type: 'gateway', status: 'online', label: 'Gateway Alpha' },
  { id: 'rl-1', x: 200, y: 180, type: 'relay', status: 'online', label: 'Relay Node 1' },
  { id: 'rl-2', x: 600, y: 220, type: 'relay', status: 'warning', label: 'Relay Node 2' },
  { id: 'rl-3', x: 400, y: 480, type: 'relay', status: 'online', label: 'Relay Node 3' },
  { id: 'ep-1', x: 100, y: 80, type: 'endpoint', status: 'online', label: 'Endpoint 1' },
  { id: 'ep-2', x: 80, y: 300, type: 'endpoint', status: 'offline', label: 'Endpoint 2' },
  { id: 'ep-3', x: 700, y: 80, type: 'endpoint', status: 'online', label: 'Endpoint 3' },
  { id: 'ep-4', x: 750, y: 350, type: 'endpoint', status: 'online', label: 'Endpoint 4' },
  { id: 'ep-5', x: 220, y: 550, type: 'endpoint', status: 'online', label: 'Endpoint 5' },
  { id: 'ep-6', x: 600, y: 520, type: 'endpoint', status: 'warning', label: 'Endpoint 6' },
];

// Define relationships (edges)
const INITIAL_LINKS = [
  { source: 'gw-1', target: 'rl-1', active: true },
  { source: 'gw-1', target: 'rl-2', active: true },
  { source: 'gw-1', target: 'rl-3', active: false },
  { source: 'rl-1', target: 'ep-1', active: true },
  { source: 'rl-1', target: 'ep-2', active: false },
  { source: 'rl-1', target: 'rl-3', active: true }, // Mesh connection
  { source: 'rl-2', target: 'ep-3', active: true },
  { source: 'rl-2', target: 'ep-4', active: true },
  { source: 'rl-3', target: 'ep-5', active: false },
  { source: 'rl-3', target: 'ep-6', active: true },
  { source: 'rl-2', target: 'rl-3', active: true }, // Mesh connection
];

export default function Topology() {
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [links, setLinks] = useState(INITIAL_LINKS);
  const [selectedNode, setSelectedNode] = useState(null);
  const [scale, setScale] = useState(1);

  // SIMULATION EFFECT: Randomly toggle link activity to simulate changing traffic paths
  useEffect(() => {
    const interval = setInterval(() => {
      setLinks(currentLinks => 
        currentLinks.map(link => ({
          ...link,
          // 15% chance to toggle a link's active state to simulate dynamic routing
          active: Math.random() > 0.85 ? !link.active : link.active 
        }))
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleZoom = (delta) => setScale(prev => Math.min(Math.max(0.5, prev + delta), 2));
  const resetZoom = () => setScale(1);

  return (
    <div className="h-full flex flex-col space-y-4 relative">
      
      {/* HEADER CONTROLS */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Mesh Topology Map</h1>
          <p className="text-sm text-slate-500 mt-1">Live spatial visualization of the MANET environment.</p>
        </div>
        <div className="flex gap-2 bg-white border border-slate-200 p-1 rounded-lg shadow-sm">
          <button onClick={() => handleZoom(0.1)} className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors"><ZoomIn className="h-4 w-4" /></button>
          <button onClick={() => handleZoom(-0.1)} className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors"><ZoomOut className="h-4 w-4" /></button>
          <div className="w-px bg-slate-200 mx-1"></div>
          <button onClick={resetZoom} className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors"><Maximize2 className="h-4 w-4" /></button>
        </div>
      </div>
      
      {/* CANVAS CONTAINER */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm relative overflow-hidden bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] bg-[length:24px_24px]">
        
        {/* INLINE STYLES FOR SVG DATA FLOW ANIMATION */}
        <style>{`
          @keyframes flow {
            to { stroke-dashoffset: -20; }
          }
          .link-active {
            stroke-dasharray: 5, 5;
            animation: flow 1s linear infinite;
          }
        `}</style>

        {/* THE SVG GRAPH */}
        <div className="w-full h-full flex items-center justify-center overflow-auto cursor-grab active:cursor-grabbing">
          <div style={{ transform: `scale(${scale})`, transition: 'transform 0.3s ease-out' }} className="w-[800px] h-[600px] origin-center relative">
            <svg viewBox="0 0 800 600" className="w-full h-full drop-shadow-sm">
              
              {/* RENDER EDGES (LINKS) */}
              {links.map((link, idx) => {
                const sourceNode = nodes.find(n => n.id === link.source);
                const targetNode = nodes.find(n => n.id === link.target);
                if (!sourceNode || !targetNode) return null;

                return (
                  <line 
                    key={idx}
                    x1={sourceNode.x} 
                    y1={sourceNode.y} 
                    x2={targetNode.x} 
                    y2={targetNode.y}
                    className={`transition-all duration-500 ${link.active ? 'stroke-blue-400 link-active stroke-2' : 'stroke-slate-200 stroke-[1.5px]'}`}
                  />
                );
              })}

              {/* RENDER NODES */}
              {nodes.map(node => (
                <NodeElement 
                  key={node.id} 
                  node={node} 
                  isSelected={selectedNode?.id === node.id}
                  onClick={() => setSelectedNode(node)}
                />
              ))}
            </svg>
          </div>
        </div>

        {/* FLOATING LEGEND */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur border border-slate-200 p-4 rounded-xl shadow-md pointer-events-none">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Topology Legend</h4>
          <div className="space-y-2.5">
            <LegendItem icon={Radio} label="Gateway Node" color="text-indigo-600" />
            <LegendItem icon={Server} label="Relay Node" color="text-blue-600" />
            <LegendItem icon={Smartphone} label="Endpoint" color="text-slate-600" />
            <div className="w-full h-px bg-slate-100 my-2"></div>
            <LegendItem circle="bg-emerald-500" label="Status: Online" />
            <LegendItem circle="bg-amber-500" label="Status: Warning" />
            <LegendItem circle="bg-rose-500" label="Status: Offline / Fault" />
          </div>
        </div>

        {/* SLIDE-OVER DETAILS PANEL */}
        {selectedNode && (
          <div className="absolute top-4 right-4 w-72 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in slide-in-from-right-8 duration-300">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-start">
              <div>
                <h3 className="font-bold text-slate-900">{selectedNode.label}</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedNode.id}</p>
              </div>
              <button onClick={() => setSelectedNode(null)} className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">Status</span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold capitalize border ${
                  selectedNode.status === 'online' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  selectedNode.status === 'warning' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {selectedNode.status}
                </span>
              </div>
              
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <TelemetryRow icon={Battery} label="Battery Level" value={selectedNode.status === 'offline' ? '0%' : '84%'} />
                <TelemetryRow icon={Cpu} label="CPU Load" value={selectedNode.status === 'offline' ? 'N/A' : '42%'} />
                <TelemetryRow icon={Wifi} label="Signal Strength" value={selectedNode.status === 'offline' ? 'Dropped' : '-58 dBm'} />
                <TelemetryRow icon={Activity} label="Throughput" value={selectedNode.status === 'offline' ? '0 Mbps' : '124 Mbps'} />
              </div>

              <button className="w-full mt-4 flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm">
                <Settings2 className="h-4 w-4" /> Configure Node
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---

// The individual interactive SVG Node
function NodeElement({ node, isSelected, onClick }) {
  // Determine style based on node type
  let Icon = Smartphone;
  let size = 18;
  let color = "text-slate-600";
  let bgFill = "#ffffff";
  let outlineColor = "#cbd5e1"; // slate-300

  if (node.type === 'gateway') {
    Icon = Radio;
    size = 28;
    color = "text-indigo-600";
    outlineColor = "#818cf8"; // indigo-400
  } else if (node.type === 'relay') {
    Icon = Server;
    size = 24;
    color = "text-blue-600";
    outlineColor = "#93c5fd"; // blue-300
  }

  // Determine status indicator color
  let statusColor = "#10b981"; // emerald-500
  if (node.status === 'warning') statusColor = "#f59e0b"; // amber-500
  if (node.status === 'offline') statusColor = "#f43f5e"; // rose-500

  return (
    <g 
      transform={`translate(${node.x}, ${node.y})`} 
      className="cursor-pointer group"
      onClick={onClick}
    >
      {/* Invisible larger hit area for easier clicking */}
      <circle r={size + 15} fill="transparent" />
      
      {/* Selection Halo Effect */}
      {isSelected && <circle r={size + 6} fill="none" stroke="#3b82f6" strokeWidth="2" className="animate-pulse" />}

      {/* Main Node Body */}
      <circle 
        r={size} 
        fill={bgFill} 
        stroke={outlineColor} 
        strokeWidth="3"
        className="transition-all duration-300 group-hover:drop-shadow-md" 
      />
      
      {/* Status Indicator Dot */}
      <circle 
        cx={size - 4} 
        cy={-(size - 4)} 
        r="5" 
        fill={statusColor} 
        stroke="#ffffff" 
        strokeWidth="2" 
      />
      
      {/* SVG Icon via foreignObject to easily use Lucide React components */}
      <foreignObject x={-size/2 - 2} y={-size/2 - 2} width={size + 4} height={size + 4}>
        <div className={`w-full h-full flex items-center justify-center ${color}`}>
          <Icon size={size - 6} strokeWidth={2.5} />
        </div>
      </foreignObject>

      {/* Hover Label */}
      <text 
        y={size + 16} 
        textAnchor="middle" 
        className="text-[11px] font-semibold fill-slate-600 opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-sm pointer-events-none"
      >
        {node.label}
      </text>
    </g>
  );
}

function LegendItem({ icon: Icon, circle, label, color }) {
  return (
    <div className="flex items-center gap-2.5">
      {Icon ? <Icon className={`h-4 w-4 ${color}`} /> : <div className={`h-3 w-3 rounded-full ${circle} border border-white shadow-sm`}></div>}
      <span className="text-xs font-medium text-slate-600">{label}</span>
    </div>
  );
}

function TelemetryRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon className="h-4 w-4" />
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}