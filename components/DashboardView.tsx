
import React, { useState, useEffect } from 'react';
import { fetchPulseData } from '../services/geminiService';

const DashboardView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ text: string; sources: any[] } | null>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    const getPulse = async () => {
      setLoading(true);
      let lat, lon;
      
      // Attempt to get user location
      try {
        const pos: any = await new Promise((res, rej) => {
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 });
        });
        lat = pos.coords.latitude;
        lon = pos.coords.longitude;
        setLocation({ lat, lon });
      } catch (err) {
        console.warn("Location access denied or timed out, using global context.");
      }

      try {
        const pulse = await fetchPulseData(lat, lon);
        setData(pulse);
      } catch (err) {
        console.error("Pulse fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    getPulse();
  }, []);

  // Simple helper to split markdown into sections based on typical Gemini headers
  const getSection = (title: string) => {
    if (!data?.text) return null;
    const regex = new RegExp(`(?:##|###|\\*\\*|#)?\\s*${title}[\\s\\S]*?(?=(?:##|###|\\*\\*|#)|$)`, 'i');
    const match = data.text.match(regex);
    return match ? match[0].replace(new RegExp(`^(?:##|###|\\*\\*|#)?\\s*${title}`, 'i'), '').trim() : null;
  };

  const weather = getSection('Weather');
  const festivals = getSection('Festivals');
  const trends = getSection('Trends');

  return (
    <div className="h-full flex flex-col p-8 max-w-6xl mx-auto w-full overflow-y-auto custom-scrollbar">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent">
            Lumina Pulse
          </h2>
          <p className="text-slate-400 mt-2">Real-time intelligence dashboard powered by live search grounding.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/50 rounded-full border border-slate-700 text-xs text-slate-300">
          <i className="fas fa-location-dot text-indigo-400"></i>
          {location ? `${location.lat.toFixed(2)}, ${location.lon.toFixed(2)}` : 'Global Mode'}
          <button onClick={() => window.location.reload()} className="ml-2 text-indigo-400 hover:text-indigo-300">
            <i className="fas fa-rotate"></i>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 glass rounded-3xl animate-pulse flex flex-col p-6 space-y-4">
              <div className="w-12 h-12 bg-slate-700 rounded-2xl"></div>
              <div className="h-4 bg-slate-700 rounded w-1/2"></div>
              <div className="h-2 bg-slate-700 rounded w-full"></div>
              <div className="h-2 bg-slate-700 rounded w-full"></div>
              <div className="h-2 bg-slate-700 rounded w-3/4 mt-auto"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Weather Card */}
          <div className="glass rounded-3xl p-8 border border-cyan-500/20 shadow-xl shadow-cyan-500/5 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center">
                <i className="fas fa-cloud-sun text-2xl text-cyan-400"></i>
              </div>
              <span className="text-[10px] font-bold text-cyan-400 tracking-tighter bg-cyan-400/10 px-2 py-1 rounded">LIVE GROUNDING</span>
            </div>
            <h3 className="text-xl font-bold mb-4">Real-time Weather</h3>
            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap flex-1">
              {weather || "Information currently unavailable."}
            </div>
          </div>

          {/* Festivals Card */}
          <div className="glass rounded-3xl p-8 border border-amber-500/20 shadow-xl shadow-amber-500/5 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center">
                <i className="fas fa-calendar-check text-2xl text-amber-400"></i>
              </div>
              <span className="text-[10px] font-bold text-amber-400 tracking-tighter bg-amber-400/10 px-2 py-1 rounded">CULTURAL CALENDAR</span>
            </div>
            <h3 className="text-xl font-bold mb-4">Festivals & Holidays</h3>
            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap flex-1">
              {festivals || "Searching for upcoming events..."}
            </div>
          </div>

          {/* Trends Card */}
          <div className="glass rounded-3xl p-8 border border-indigo-500/20 shadow-xl shadow-indigo-500/5 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center">
                <i className="fas fa-arrow-trend-up text-2xl text-indigo-400"></i>
              </div>
              <span className="text-[10px] font-bold text-indigo-400 tracking-tighter bg-indigo-400/10 px-2 py-1 rounded">WORLD TRENDS</span>
            </div>
            <h3 className="text-xl font-bold mb-4">Trending Intelligence</h3>
            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap flex-1">
              {trends || "Analyzing global news streams..."}
            </div>
          </div>
        </div>
      )}

      {data?.sources && data.sources.length > 0 && (
        <div className="mt-12">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Verification Sources</h3>
          <div className="flex flex-wrap gap-3">
            {data.sources.slice(0, 4).map((src, i) => (
              <a
                key={i}
                href={src.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 glass rounded-full border-slate-700 text-[11px] text-slate-400 hover:text-indigo-300 hover:border-indigo-500/50 transition-all flex items-center gap-2"
              >
                <i className="fas fa-link text-[10px]"></i>
                {src.title}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardView;
