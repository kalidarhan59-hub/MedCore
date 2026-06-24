import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, ChatMessage } from '../types';
import { analyzeSymptoms } from '../services/geminiService';
import { Send, AlertTriangle, ShieldCheck, Clock, Loader2, Bot } from 'lucide-react';

interface Props {
  user: UserProfile;
}

export default function SymptomChecker({ user }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('medcore_chat');
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      const greeting = user.role === 'patient' 
        ? 'Здравствуйте! Я ваш медицинский ИИ-ассистент. Расскажите подробно, что вас беспокоит?'
        : `Здравствуйте, доктор ${user.name}. Я готов помочь вам с анализом клинических случаев.`;
      
      const initMsg: ChatMessage = { id: Date.now().toString(), role: 'ai', text: greeting };
      setMessages([initMsg]);
      localStorage.setItem('medcore_chat', JSON.stringify([initMsg]));
    }
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    localStorage.setItem('medcore_chat', JSON.stringify(newHistory));
    setInput('');
    setIsLoading(true);

    try {
      const res = await analyzeSymptoms(newHistory);
      
      const aiMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'ai', 
        text: res.text,
        risk: res.risk
      };
      
      const updatedHistory = [...newHistory, aiMsg];
      setMessages(updatedHistory);
      localStorage.setItem('medcore_chat', JSON.stringify(updatedHistory));
      
    } catch (error: any) {
      console.error(error);
      const errMsg: ChatMessage = { id: Date.now().toString(), role: 'ai', text: `Ошибка при обращении к ИИ: ${error.message || 'сервис временно недоступен'}. Пожалуйста, попробуйте еще раз позже.` };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case 'HIGH': return 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.3)]';
      case 'MEDIUM': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.3)]';
      case 'LOW': return 'bg-teal-500/20 text-teal-400 border border-teal-500/30 shadow-[0_0_15px_rgba(20,184,166,0.3)]';
      default: return 'bg-white/5 text-slate-400 border-white/10';
    }
  };

  const getRiskIcon = (risk?: string) => {
    switch (risk) {
      case 'HIGH': return <AlertTriangle className="w-5 h-5 text-rose-400 mr-2" />;
      case 'MEDIUM': return <Clock className="w-5 h-5 text-amber-400 mr-2" />;
      case 'LOW': return <ShieldCheck className="w-5 h-5 text-teal-400 mr-2" />;
      default: return null;
    }
  };
  
  // Last message determines the frame border color if risk is set
  const lastRisk = [...messages].reverse().find(m => m.role === 'ai' && m.risk && m.risk !== 'UNKNOWN')?.risk;
  const frameBorderClass = lastRisk === 'HIGH' ? 'border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.15)]' 
    : lastRisk === 'MEDIUM' ? 'border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.15)]'
    : lastRisk === 'LOW' ? 'border-teal-500/50 shadow-[0_0_30px_rgba(20,184,166,0.15)]'
    : 'border-white/10 shadow-2xl';

  return (
    <div className={`backdrop-blur-xl bg-slate-900/40 border-2 ${frameBorderClass} rounded-2xl md:rounded-[2.5rem] overflow-hidden flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] transition-all duration-500 relative`}>
      {/* Background glow based on risk */}
      {lastRisk && (
        <div className={`absolute inset-0 opacity-10 pointer-events-none transition-colors duration-1000 ${
          lastRisk === 'HIGH' ? 'bg-rose-500' : lastRisk === 'MEDIUM' ? 'bg-amber-500' : 'bg-teal-500'
        }`} />
      )}
      
      <div className="p-5 md:p-6 border-b border-white/10 bg-white/5 backdrop-blur-md relative z-10 flex justify-between items-center">
        <h2 className="font-bold text-lg md:text-xl text-white flex items-center">
          <div className="relative flex items-center justify-center mr-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${user.role === 'patient' ? 'bg-teal-500/20 border border-teal-500/30' : 'bg-indigo-500/20 border border-indigo-500/30'}`}>
              <Bot className={`w-5 h-5 ${user.role === 'patient' ? 'text-teal-400' : 'text-indigo-400'}`} />
            </div>
            {isLoading && <div className="absolute inset-0 rounded-xl border border-white/30 animate-ping" />}
          </div>
          <div>
            {user.role === 'patient' ? 'Умный Триаж' : 'Ассистент врача'}
            <span className="block text-xs text-slate-400 font-medium mt-0.5">Всегда на связи</span>
          </div>
        </h2>
        
        {lastRisk && (
           <div className={`px-3 py-1 rounded-lg text-xs font-bold border flex items-center backdrop-blur-md ${getRiskColor(lastRisk)}`}>
             {getRiskIcon(lastRisk)}
             {lastRisk === 'HIGH' ? 'ВЫСОКИЙ РИСК' : lastRisk === 'MEDIUM' ? 'СРЕДНИЙ РИСК' : 'НИЗКИЙ РИСК'}
           </div>
        )}
      </div>

      <div className="flex-1 p-5 md:p-8 overflow-y-auto space-y-6 custom-scrollbar relative z-10" ref={scrollRef}>
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
            {msg.role === 'ai' && (
              <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center border shadow-inner ${user.role === 'patient' ? 'bg-teal-500/20 border-teal-500/30 text-teal-400' : 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400'}`}>
                <Bot className="w-5 h-5" />
              </div>
            )}
            <div className={`max-w-[85%] rounded-3xl p-4 md:p-5 text-sm md:text-base leading-relaxed shadow-xl ${
              msg.role === 'user' 
                ? (user.role === 'patient' ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-br-sm' : 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-br-sm')
                : 'bg-white/10 text-slate-200 rounded-tl-sm border border-white/5 backdrop-blur-md'
            }`}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
              
              {msg.role === 'ai' && msg.risk && msg.risk !== 'UNKNOWN' && (
                <div className={`mt-4 flex items-center p-3 rounded-xl border backdrop-blur-md ${getRiskColor(msg.risk)}`}>
                  {getRiskIcon(msg.risk)}
                  <span className="font-bold text-sm tracking-wide">
                    {msg.risk === 'HIGH' ? 'КРИТИЧЕСКИЙ РИСК: Рекомендуется срочный вызов скорой помощи.' : 
                     msg.risk === 'MEDIUM' ? 'СРЕДНИЙ РИСК: Рекомендуется плановая запись к врачу.' : 
                     'НИЗКИЙ РИСК: Состояние не вызывает опасений. Соблюдайте режим отдыха.'}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4 justify-start animate-in fade-in">
            <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center border shadow-inner ${user.role === 'patient' ? 'bg-teal-500/20 border-teal-500/30 text-teal-400' : 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400'}`}>
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div className="bg-white/5 text-teal-300 border border-white/5 rounded-3xl rounded-tl-sm p-4 md:p-5 flex items-center shadow-xl backdrop-blur-md">
              <span className="mr-3 font-medium text-sm">ИИ анализирует симптомы</span>
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 md:p-6 border-t border-white/10 bg-slate-900/50 backdrop-blur-md relative z-10">
        <div className="flex gap-3 relative max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isLoading ? "ИИ печатает ответ..." : "Опишите свои симптомы в свободной форме..."}
            className="flex-1 w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-teal-500 focus:bg-white/10 transition-all placeholder:text-slate-500 shadow-inner"
            disabled={isLoading}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className={`px-6 py-4 rounded-2xl text-white font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
              user.role === 'patient' ? 'bg-teal-500 hover:bg-teal-400 shadow-teal-500/25' : 'bg-indigo-500 hover:bg-indigo-400 shadow-indigo-500/25'
            } disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed shadow-xl flex items-center justify-center`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
