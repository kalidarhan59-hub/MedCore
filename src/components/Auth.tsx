import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Activity } from 'lucide-react';

interface AuthProps {
  onLogin: (user: UserProfile) => void;
}

const specializations = ['Терапевт', 'Кардиолог', 'Невролог', 'Педиатр', 'Дерматолог', 'Хирург'];

export default function Auth({ onLogin }: AuthProps) {
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState(specializations[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    const user: UserProfile = {
      id: Date.now().toString(),
      name,
      role,
      ...(role === 'doctor' ? { specialization } : {})
    };
    
    localStorage.setItem('medcore_user', JSON.stringify(user));
    
    // Generate default data on first login
    if (!localStorage.getItem('medcore_metrics')) {
      const today = new Date();
      const pastDays = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (6 - i));
        return {
          id: Date.now().toString() + i,
          date: d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
          systolic: 110 + Math.floor(Math.random() * 20),
          diastolic: 70 + Math.floor(Math.random() * 15),
          pulse: 65 + Math.floor(Math.random() * 20),
          sleep: 6 + Math.random() * 3
        };
      });
      localStorage.setItem('medcore_metrics', JSON.stringify(pastDays));
    }
    
    if (!localStorage.getItem('medcore_chat')) {
      const welcomeMsg = role === 'patient' 
        ? { id: '1', role: 'ai', text: 'Здравствуйте! Я ваш медицинский ИИ-ассистент. Опишите ваши симптомы, и я помогу провести предварительную оценку вашего состояния.', timestamp: Date.now() }
        : { id: '1', role: 'ai', text: 'Приветствую, доктор! Я ваш клинический ИИ-ассистент. Я могу помочь с анализом симптомов, расшифровкой снимков или дифференциальной диагностикой. Какой клинический случай рассмотрим сегодня?', timestamp: Date.now() };
      localStorage.setItem('medcore_chat', JSON.stringify([welcomeMsg]));
    }
    
    if (!localStorage.getItem('medcore_habits')) {
      localStorage.setItem('medcore_habits', JSON.stringify({ water: false, workout: false, sleep: false }));
    }
    
    onLogin(user);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0f172a] p-4 relative overflow-hidden text-slate-200">
      {/* Background blobs for glassmorphism effect */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-teal-600/30 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]" />
      
      <div className="bg-white/5 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl border border-white/10 w-full max-w-md relative z-10 animate-in zoom-in-95 duration-500">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-teal-500/25">
            <Activity className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-center mb-8 text-white tracking-tight">
          MedCore AI
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10">
            <button
              type="button"
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${role === 'patient' ? 'bg-teal-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              onClick={() => setRole('patient')}
            >
              Я Пациент
            </button>
            <button
              type="button"
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${role === 'doctor' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              onClick={() => setRole('doctor')}
            >
              Я Врач
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Как к вам обращаться?</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 focus:outline-none focus:border-teal-500 focus:bg-white/10 transition-all text-white placeholder-slate-500 shadow-inner"
              placeholder="Имя Фамилия"
            />
          </div>

          {role === 'doctor' && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <label className="block text-sm font-medium text-slate-400 mb-2">Ваша специализация</label>
              <select
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full px-5 py-3.5 rounded-2xl bg-[#1e293b] border border-white/10 focus:outline-none focus:border-indigo-500 transition-all text-white shadow-inner appearance-none cursor-pointer"
              >
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            className={`w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
              role === 'patient' ? 'bg-teal-500 hover:bg-teal-400 shadow-teal-500/25' : 'bg-indigo-500 hover:bg-indigo-400 shadow-indigo-500/25'
            }`}
          >
            Начать работу
          </button>
        </form>
      </div>
    </div>
  );
}
