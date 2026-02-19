
import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import { GeneratedImage } from '../types';

const ImageView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setError(null);

    try {
      const url = await generateImage(prompt);
      const newImg: GeneratedImage = {
        url,
        prompt,
        timestamp: new Date(),
      };
      setHistory(prev => [newImg, ...prev]);
      setPrompt('');
    } catch (err) {
      console.error(err);
      setError('Generation failed. Please try a different prompt.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-8 max-w-6xl mx-auto w-full">
      <div className="mb-12 text-center">
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Imagine Anything
        </h2>
        <p className="text-slate-400">Transform your words into stunning visual art in seconds.</p>
      </div>

      <form onSubmit={handleGenerate} className="mb-12 max-w-2xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row gap-3 glass p-2 rounded-2xl border-indigo-500/20 shadow-2xl shadow-indigo-500/5">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A surreal landscape with floating islands and neon waterfalls..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-100 placeholder-slate-500 p-4"
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <><i className="fas fa-spinner fa-spin"></i> Generating...</>
            ) : (
              <><i className="fas fa-sparkles"></i> Create</>
            )}
          </button>
        </div>
        {error && <p className="text-red-400 text-sm mt-3 text-center">{error}</p>}
      </form>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-600 opacity-50">
            <i className="fas fa-image text-6xl mb-4"></i>
            <p>Your creation history will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {history.map((item, i) => (
              <div key={i} className="group relative glass rounded-2xl overflow-hidden border border-slate-700/50 hover:border-indigo-500/50 transition-all">
                <img src={item.url} alt={item.prompt} className="w-full aspect-square object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                  <p className="text-sm font-medium line-clamp-2 mb-3">{item.prompt}</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => window.open(item.url, '_blank')}
                      className="flex-1 py-2 bg-indigo-500/80 hover:bg-indigo-500 text-xs font-bold rounded-lg transition-colors"
                    >
                      DOWNLOAD
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageView;
