import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Bot, RefreshCw, ExternalLink } from 'lucide-react';
import type { MercedesCarModel } from '../../data/content';

interface AIChatbotProps {
  selectedCar: MercedesCarModel;
  onSelectCar: (carId: string) => void;
  onNavigateTab?: (tab: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  action?: {
    type: string;
    targetCarId?: string;
    label: string;
  };
}

export const AIChatbot: React.FC<AIChatbotProps> = ({ selectedCar, onSelectCar, onNavigateTab }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputMsg, setInputMsg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `Hello! I am your **AI Studio Automotive Intelligence Assistant**. Ask me to compare Mercedes flagships with global rivals (**Ferrari SF90, Porsche GT3 RS, Tesla Plaid, Rolls-Royce Phantom**), analyze telemetry, maintenance costs, or book private track allocations!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const queryText = textToSend || inputMsg;
    if (!queryText.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMsg('');
    setLoading(true);

    try {
      let res;
      try {
        res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: queryText, currentCarId: selectedCar.id }),
        });
        if (!res.ok) throw new Error();
      } catch (e) {
        res = await fetch('http://localhost:5000/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: queryText, currentCarId: selectedCar.id }),
        });
      }

      const data = await res.json();

      if (data.success) {
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: data.data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action: data.data.action,
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (err) {
      // Fallback AI Studio response
      const botMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        sender: 'assistant',
        text: `### 🤖 AI Studio Telemetry Assistant\n\nThe **${selectedCar.name}** features ${selectedCar.engine} producing **${selectedCar.horsepower} HP** with 0-60 in **${selectedCar.zeroToSixty}s**. Price allocation starts at **${selectedCar.price}**.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: { type: 'switch_car', targetCarId: selectedCar.id, label: `Explore ${selectedCar.name}` }
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action: { type: string; targetCarId?: string; label: string }) => {
    if (action.type === 'switch_car' && action.targetCarId) {
      onSelectCar(action.targetCarId);
    } else if (action.type === 'open_compare' && onNavigateTab) {
      onNavigateTab('compare');
    } else if (action.type === 'open_finance' && onNavigateTab) {
      onNavigateTab('finance');
    } else if (action.type === 'book_drive') {
      const el = document.getElementById('test-drive');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Simple Markdown Table Formatter helper
  const renderFormattedText = (text: string) => {
    if (text.includes('|')) {
      const lines = text.split('\n');
      return (
        <div className="space-y-2 text-xs">
          {lines.map((line, idx) => {
            if (line.startsWith('|')) {
              const cells = line.split('|').filter(c => c.trim() !== '');
              return (
                <div key={idx} className="grid grid-cols-3 gap-2 py-1 border-b border-neutral-800 text-[11px] font-mono">
                  {cells.map((cell, cIdx) => (
                    <div key={cIdx} className={cIdx === 0 ? 'text-neutral-400 font-semibold' : 'text-emerald-300 font-bold'}>
                      {cell.trim().replace(/\*\*/g, '')}
                    </div>
                  ))}
                </div>
              );
            }
            return <p key={idx} className="my-1">{line.replace(/###/g, '').replace(/\*\*/g, '')}</p>;
          })}
        </div>
      );
    }

    return (
      <div className="text-xs whitespace-pre-wrap leading-relaxed">
        {text.replace(/###/g, '').replace(/\*\*/g, '')}
      </div>
    );
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold shadow-[0_0_30px_rgba(0,210,190,0.5)] hover:scale-105 transition-all flex items-center gap-2 group"
      >
        <Sparkles className="w-5 h-5 text-black animate-spin" />
        <span className="text-xs font-mono font-bold uppercase tracking-wider hidden sm:inline">AI Studio Assistant</span>
      </button>

      {/* Chat Drawer Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[460px] h-[580px] bg-neutral-950/95 border border-emerald-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl animate-in slide-in-from-bottom duration-300">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-neutral-900 to-neutral-950 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>AI Studio Assistant</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                </h3>
                <p className="text-[10px] font-mono text-emerald-400/90 uppercase">Cross-Brand Car & Spec Intelligence</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-neutral-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Prompt Chips Bar */}
          <div className="p-2.5 bg-neutral-900/60 border-b border-neutral-800 flex items-center gap-2 overflow-x-auto text-[11px] font-mono no-scrollbar">
            <button onClick={() => handleSendMessage("Compare AMG-ONE vs Ferrari SF90")} className="px-2.5 py-1 rounded-full bg-neutral-800 hover:bg-emerald-500/20 border border-neutral-700 text-neutral-300 hover:text-emerald-300 whitespace-nowrap">
              🏎️ AMG-ONE vs Ferrari SF90
            </button>
            <button onClick={() => handleSendMessage("Compare EQS 53 vs Tesla Model S Plaid")} className="px-2.5 py-1 rounded-full bg-neutral-800 hover:bg-cyan-500/20 border border-neutral-700 text-neutral-300 hover:text-cyan-300 whitespace-nowrap">
              ⚡ EQS 53 vs Tesla Plaid
            </button>
            <button onClick={() => handleSendMessage("Compare GT Black Series vs Porsche GT3 RS")} className="px-2.5 py-1 rounded-full bg-neutral-800 hover:bg-emerald-500/20 border border-neutral-700 text-neutral-300 hover:text-emerald-300 whitespace-nowrap">
              🏁 GT Black Series vs Porsche GT3 RS
            </button>
            <button onClick={() => handleSendMessage("What is annual maintenance cost?")} className="px-2.5 py-1 rounded-full bg-neutral-800 hover:bg-amber-500/20 border border-neutral-700 text-neutral-300 hover:text-amber-300 whitespace-nowrap">
              💰 Maintenance Costs
            </button>
          </div>

          {/* Messages Scroll View */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 font-body">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] rounded-2xl p-3.5 ${
                  msg.sender === 'user'
                    ? 'bg-emerald-500 text-black font-semibold rounded-br-none'
                    : 'bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-bl-none shadow-lg'
                }`}>
                  {renderFormattedText(msg.text)}

                  {/* Interactive Action Button */}
                  {msg.action && (
                    <button
                      onClick={() => handleActionClick(msg.action!)}
                      className="mt-3 w-full py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-mono text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition"
                    >
                      <span>{msg.action.label}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <div className="text-[9px] font-mono opacity-60 text-right mt-1.5">{msg.timestamp}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-2xl text-xs text-emerald-400 font-mono flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>AI Studio analyzing automotive telemetry...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-neutral-900 border-t border-neutral-800 flex items-center gap-2">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask anything about cars, pricing, Ferrari/Porsche comparisons..."
              className="flex-1 bg-neutral-950 border border-neutral-800 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-400"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !inputMsg.trim()}
              className="p-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-bold disabled:opacity-50 transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
