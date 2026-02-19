
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { streamChat } from '../services/geminiService';

const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I am Lumina. How can I assist you today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Explicitly type file as File to avoid "unknown" type error in some environments.
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setSelectedImages((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && selectedImages.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      images: selectedImages.length > 0 ? [...selectedImages] : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setSelectedImages([]);
    setIsTyping(true);

    const assistantMsgId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      },
    ]);

    try {
      let fullContent = '';
      const chatStream = streamChat(userMessage.content, [], userMessage.images);
      
      for await (const chunk of chatStream) {
        fullContent += chunk;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId ? { ...msg, content: fullContent } : msg
          )
        );
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? { ...msg, content: 'Sorry, I encountered an error. Please try again.' }
            : msg
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full px-4 pt-4">
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-4 space-y-6" ref={scrollRef}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-slate-800 text-slate-100 border border-slate-700'
              }`}
            >
              {msg.images && msg.images.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {msg.images.map((img, idx) => (
                    <img key={idx} src={img} alt="upload" className="w-24 h-24 object-cover rounded-lg border border-white/20" />
                  ))}
                </div>
              )}
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              <div className="mt-2 text-[10px] opacity-50 text-right">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 flex gap-1">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
      </div>

      <div className="pb-8">
        <form onSubmit={handleSubmit} className="relative group">
          {selectedImages.length > 0 && (
            <div className="absolute bottom-full left-0 mb-4 flex flex-wrap gap-2 bg-slate-800/90 p-3 rounded-xl border border-slate-700 backdrop-blur-sm">
              {selectedImages.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img src={img} className="w-16 h-16 object-cover rounded-lg" alt="preview" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 glass p-2 rounded-2xl focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all duration-300">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-slate-700 transition-colors"
            >
              <i className="fas fa-paperclip text-lg"></i>
            </button>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageSelect}
            />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message Lumina..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-slate-100 placeholder-slate-500 py-3"
            />
            <button
              type="submit"
              disabled={(!input.trim() && selectedImages.length === 0) || isTyping}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-indigo-500 text-white disabled:opacity-50 disabled:bg-slate-700 hover:bg-indigo-600 transition-all"
            >
              <i className="fas fa-arrow-up"></i>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatView;
