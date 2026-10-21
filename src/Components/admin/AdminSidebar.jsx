import React from 'react';

export default function AdminSidebar({ navItems, activeTab, setActiveTab }) {
  return (
    <aside className="w-64 bg-slate-900/60 border-r border-slate-800 flex flex-col justify-between shrink-0 h-[calc(100vh-65px)] sticky top-[65px]">
      {/* Navigation Links */}
      <div className="p-4 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-mono font-semibold uppercase text-slate-500 tracking-wider">
          Management
        </div>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                isActive
                  ? 'bg-red-600/10 text-red-400 border border-red-600/30'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sidebar Footer Info */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/30">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-300 border border-slate-700">
            A
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-medium text-slate-200 truncate">
              Administrator
            </p>
            <p className="text-[10px] text-slate-500 font-mono">
              System Active
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}