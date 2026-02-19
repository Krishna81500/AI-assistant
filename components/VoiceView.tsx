
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob as GeminiBlob } from '@google/genai';
import { decodePCM, decodeAudioData, createGeminiAudioBlob } from '../services/audioService';

const VoiceView: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [visualizerBars, setVisualizerBars] = useState<number[]>(Array(20).fill(10));

  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const transcriptionRef = useRef({ user: '', model: '' });

  const startVisualizer = useCallback(() => {
    const interval = setInterval(() => {
      setVisualizerBars(prev => prev.map(() => Math.floor(Math.random() * 40) + 10));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let stopVis: (() => void) | undefined;
    if (isActive) {
      stopVis = startVisualizer();
    } else {
      setVisualizerBars(Array(20).fill(10));
    }
    return () => stopVis?.();
  }, [isActive, startVisualizer]);

  const toggleSession = async () => {
    if (isActive) {
      sessionRef.current?.close?.();
      setIsActive(false);
      return;
    }

    setIsConnecting(true);
    try {
      // Create a new GoogleGenAI instance right before making the API call as per guidelines.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            console.debug('Live session opened');
            setIsActive(true);
            setIsConnecting(false);

            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob: GeminiBlob = createGeminiAudioBlob(inputData);
              // CRITICAL: Solely rely on sessionPromise resolves and then call `session.sendRealtimeInput`.
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              transcriptionRef.current.model += message.serverContent.outputTranscription.text;
            } else if (message.serverContent?.inputTranscription) {
              transcriptionRef.current.user += message.serverContent.inputTranscription.text;
            }

            if (message.serverContent?.turnComplete) {
              const u = transcriptionRef.current.user;
              const m = transcriptionRef.current.model;
              if (u || m) {
                setTranscript(prev => [...prev, `You: ${u}`, `Lumina: ${m}`]);
              }
              transcriptionRef.current = { user: '', model: '' };
            }

            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(decodePCM(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              
              source.onended = () => sourcesRef.current.delete(source);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              for (const source of sourcesRef.current.values()) {
                source.stop();
                sourcesRef.current.delete(source);
              }
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Live session error:', e);
            setIsActive(false);
            setIsConnecting(false);
          },
          onclose: () => {
            console.debug('Live session closed');
            setIsActive(false);
            setIsConnecting(false);
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          systemInstruction: 'You are Lumina, a friendly and helpful real-time AI assistant. Keep responses naturally conversational and concise.',
        },
      });

      const session = await sessionPromise;
      sessionRef.current = session;

    } catch (error) {
      console.error('Failed to start voice session:', error);
      setIsConnecting(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 max-w-2xl mx-auto">
      <div className="flex-1 w-full flex flex-col items-center justify-center gap-12">
        <div className="relative">
          <div className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-700 ${
            isActive ? 'bg-indigo-600 shadow-[0_0_80px_rgba(79,70,229,0.4)]' : 'bg-slate-800'
          }`}>
            <div className={`w-40 h-40 rounded-full border-4 flex items-center justify-center ${
              isActive ? 'border-white animate-pulse-glow' : 'border-slate-700'
            }`}>
              <i className={`fas fa-microphone text-5xl ${isActive ? 'text-white' : 'text-slate-600'}`}></i>
            </div>
          </div>
          {isActive && (
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-1 h-8">
              {visualizerBars.map((h, i) => (
                <div 
                  key={i} 
                  className="w-1 bg-indigo-400 rounded-full transition-all duration-100" 
                  style={{ height: `${h}%` }}
                ></div>
              ))}
            </div>
          )}
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">
            {isConnecting ? 'Initializing...' : isActive ? 'Listening & Speaking' : 'Live Voice Assistant'}
          </h2>
          <p className="text-slate-400 max-w-sm mx-auto">
            {isActive 
              ? 'Lumina is ready. Just start talking like you would to a human.' 
              : 'Experience a natural, low-latency voice conversation with Lumina.'}
          </p>
        </div>

        <button
          onClick={toggleSession}
          disabled={isConnecting}
          className={`px-12 py-4 rounded-full font-bold text-lg transition-all duration-300 transform active:scale-95 flex items-center gap-3 ${
            isActive 
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-xl shadow-red-500/20' 
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/20'
          }`}
        >
          {isConnecting ? (
            <i className="fas fa-spinner fa-spin"></i>
          ) : (
            <i className={`fas ${isActive ? 'fa-stop' : 'fa-play'}`}></i>
          )}
          {isActive ? 'Stop Conversation' : 'Start Session'}
        </button>
      </div>

      <div className="w-full mt-8 max-h-48 overflow-y-auto custom-scrollbar p-4 rounded-2xl bg-slate-800/30 border border-slate-700/50">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Live Transcript</p>
        {transcript.length === 0 ? (
          <p className="text-sm text-slate-600 italic">Conversation history will appear here...</p>
        ) : (
          <div className="space-y-2">
            {transcript.map((line, i) => (
              <p key={i} className={`text-sm ${line.startsWith('You:') ? 'text-slate-300' : 'text-indigo-300 font-medium'}`}>
                {line}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceView;
