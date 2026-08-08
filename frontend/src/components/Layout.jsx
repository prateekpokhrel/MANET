import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  Radio, Menu, Search, LayoutGrid, Wifi, 
  Server, PlayCircle, BrainCircuit, ShieldCheck, 
  FileText, Settings 
} from 'lucide-react';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden selection:bg-blue-100">
      
      {/* SIDEBAR */}
      <aside className={`bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex flex-col z-20 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="h-16 flex items-center px-5 border-b border-slate-100">
          <div className="flex items-center justify-center h-8 w-8 rounded bg-blue-600 text-white shrink-0">
            <Radio className="h-5 w-5" />
          </div>
          {sidebarOpen && <span className="ml-3 font-semibold text-slate-800 tracking-tight">MANET Core</span>}
        </div>
        
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <p className={`px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-4 ${!sidebarOpen && 'hidden'}`}>Overview</p>
          <NavItem to="/dashboard" icon={LayoutGrid} label="Dashboard" isOpen={sidebarOpen} />
          <NavItem to="/topology" icon={Wifi} label="Mesh Topology" isOpen={sidebarOpen} />
          <NavItem to="/node" icon={Server} label="Node Inventory" isOpen={sidebarOpen} />
          <NavItem to="/simulation" icon={PlayCircle} label="Environment Sim" isOpen={sidebarOpen} />
          
          <p className={`px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-6 ${!sidebarOpen && 'hidden'}`}>AI & Health</p>
          <NavItem to="/analysis" icon={BrainCircuit} label="AI Analysis" isOpen={sidebarOpen} />
          <NavItem to="/recoverability" icon={ShieldCheck} label="Recoverability" isOpen={sidebarOpen} />
          
          <p className={`px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-6 ${!sidebarOpen && 'hidden'}`}>Management</p>
          <NavItem to="/logs" icon={FileText} label="Recovery Logs" badge="2" badgeColor="bg-rose-100 text-rose-700" isOpen={sidebarOpen} />
          <NavItem to="/settings" icon={Settings} label="System Config" isOpen={sidebarOpen} />
        </nav>
        
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
              <span className="text-sm font-medium text-slate-600">OP</span>
            </div>
            {sidebarOpen && (
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-900">Lead Operator</span>
                <span className="text-xs text-slate-500">NOC Session Active</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* GLOBAL HEADER */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 transition-colors">
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-slate-800">Virtual MANET NOC</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              <span className="text-xs font-medium text-emerald-700">Live Sync</span>
            </div>

            <div className="relative group hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search nodes, alerts, IPs..." 
                className="w-72 pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                 <kbd className="px-1.5 py-0.5 rounded border border-slate-200 bg-white text-[10px] text-slate-400 font-mono">⌘</kbd>
                 <kbd className="px-1.5 py-0.5 rounded border border-slate-200 bg-white text-[10px] text-slate-400 font-mono">K</kbd>
              </div>
            </div>
          </div>
        </header>

        {/* DYNAMIC PAGE RENDERER - This injects the clicked page into the layout */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
           <Outlet />
        </main>
      </div>
    </div>
  );
}

// Helper Component for Routing Navigation
function NavItem({ to, icon: Icon, label, isOpen, badge, badgeColor }) {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => `flex items-center justify-between px-3 py-2 rounded-lg transition-colors group ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
    >
      {({ isActive }) => (
        <>
          <div className="flex items-center">
            <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
            {isOpen && <span className={`ml-3 text-sm font-medium whitespace-nowrap ${isActive ? 'text-blue-700' : ''}`}>{label}</span>}
          </div>
          {isOpen && badge && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeColor}`}>{badge}</span>
          )}
        </>
      )}
    </NavLink>
  );
}