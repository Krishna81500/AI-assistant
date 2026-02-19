
import React from 'react';
import { AppMode } from '../types';

interface SidebarProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentMode, setMode }) => {
  const items = [
    { id: AppMode.DASHBOARD, icon: 'fa-chart-line', label: 'Pulse' },
    { id: AppMode.CHAT, icon: 'fa-comment-dots', label: 'Chat' },
    { id: AppMode.VOICE, icon: 'fa-microphone', label: 'Live Voice' },
    { id: AppMode.IMAGE, icon: 'fa-wand-magic-sparkles', label: 'Imagine' },
    { id: AppMode.SEARCH, icon: 'fa-globe', label: 'Search' },
  ];

  return (
    <div className="w-20 md:w-64 glass h-full flex flex-col items-center py-8 z-50">
      <div className="mb-12 flex items-center gap-3 px-4">
        <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <i className="fas fa-bolt text-white text-xl"></i>
        </div>
        <span className="hidden md:block font-bold text-xl tracking-tight">Lumina</span>
      </div>

      <nav className="flex-1 w-full space-y-4 px-2 md:px-4">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setMode(item.id)}
            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-300 ${
              currentMode === item.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <div className="w-6 flex justify-center">
              <i className={`fas ${item.icon} text-lg`}></i>
            </div>
            <span className="hidden md:block font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto px-4 w-full">
        <div className="hidden md:block p-4 rounded-2xl bg-slate-800/50 border border-slate-700">
          <p className="text-xs text-slate-500 mb-2">PRO VERSION</p>
          <p className="text-sm font-semibold mb-3">Upgrade to Lumina Pro</p>
          <button className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-xs font-bold rounded-lg transition-colors">
            GET ACCESS
          </button>
        </div>
        <div className="md:hidden w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center cursor-pointer mx-auto">
          <i className="fas fa-user text-slate-400"></i>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
