
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import VoiceView from './components/VoiceView';
import ImageView from './components/ImageView';
import SearchView from './components/SearchView';
import DashboardView from './components/DashboardView';
import { AppMode } from './types';

const App: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<AppMode>(AppMode.DASHBOARD);

  const renderContent = () => {
    switch (currentMode) {
      case AppMode.DASHBOARD:
        return <DashboardView />;
      case AppMode.CHAT:
        return <ChatView />;
      case AppMode.VOICE:
        return <VoiceView />;
      case AppMode.IMAGE:
        return <ImageView />;
      case AppMode.SEARCH:
        return <SearchView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <Sidebar currentMode={currentMode} setMode={setCurrentMode} />
      
      <main className="flex-1 relative flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-8 border-b border-slate-800 glass z-40">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
              {currentMode === AppMode.DASHBOARD && 'Intelligence Pulse'}
              {currentMode === AppMode.CHAT && 'Conversational AI'}
              {currentMode === AppMode.VOICE && 'Real-time Interaction'}
              {currentMode === AppMode.IMAGE && 'Creative Engine'}
              {currentMode === AppMode.SEARCH && 'Knowledge Engine'}
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
              <span className="text-xs font-medium text-slate-400">Gemini 3 Flash Live</span>
            </div>
            <div className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors">
              <i className="fas fa-bell text-slate-400"></i>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          {renderContent()}
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/5 blur-[100px] rounded-full pointer-events-none -z-10"></div>
      </main>
    </div>
  );
};

export default App;
