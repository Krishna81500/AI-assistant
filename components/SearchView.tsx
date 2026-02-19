
import React, { useState } from 'react';
import { searchInformation } from '../services/geminiService';

const SearchView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<{ text: string, sources: any[] } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isSearching) return;

    setIsSearching(true);
    try {
      const data = await searchInformation(query);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-8 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <i className="fas fa-earth-americas text-indigo-500"></i>
          Web Search
        </h2>
        <p className="text-slate-400 mt-2">Get accurate, real-time information from the web with grounding.</p>
      </div>

      <form onSubmit={handleSearch} className="mb-10">
        <div className="flex gap-2 p-2 glass rounded-2xl border-slate-700">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Latest news about Space X, stock market trends, etc..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-100 p-3"
          />
          <button
            type="submit"
            disabled={!query.trim() || isSearching}
            className="bg-indigo-600 hover:bg-indigo-700 px-6 py-2 rounded-xl text-white font-bold transition-all disabled:opacity-50"
          >
            {isSearching ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-search"></i>}
          </button>
        </div>
      </form>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {!result && !isSearching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['Current market analysis of NVIDIA', 'Who won the Oscars 2024?', 'Weather in Tokyo for next week', 'Top trending AI news'].map((q, i) => (
              <button
                key={i}
                onClick={() => setQuery(q)}
                className="p-4 text-left glass rounded-xl border-slate-700/50 hover:bg-slate-800 transition-colors text-slate-300 text-sm"
              >
                {q}
              </button>
            ))}
          </div>
        ) : isSearching ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-4 bg-slate-800 rounded w-3/4"></div>
            <div className="h-4 bg-slate-800 rounded w-1/2"></div>
            <div className="h-4 bg-slate-800 rounded w-5/6"></div>
          </div>
        ) : (
          <div className="space-y-8 pb-12">
            <div className="glass p-6 rounded-2xl border-slate-700">
              <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{result?.text}</p>
            </div>

            {result?.sources && result.sources.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Sources Found</h3>
                <div className="space-y-3">
                  {result.sources.map((src, i) => (
                    <a
                      key={i}
                      href={src.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 glass rounded-xl border-slate-700 hover:border-indigo-500/50 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">{src.title}</span>
                        <i className="fas fa-external-link-alt text-[10px] text-slate-500"></i>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 truncate">{src.uri}</p>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchView;
