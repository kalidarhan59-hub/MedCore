import React, { useState, useEffect } from 'react';
import { Droplet, Dumbbell, Moon, CheckCircle2, Sparkles, Loader2, Target, Calendar, Activity } from 'lucide-react';
import { generateWorkoutPlan } from '../services/geminiService';
import { Metric } from '../types';
import Toast from './Toast';

export default function LifestyleSport() {
  const [water, setWater] = useState(false);
  const [workout, setWorkout] = useState(false);
  const [sleep, setSleep] = useState(false);
  const [medications, setMedications] = useState<{ id: string, name: string, time: string }[]>([]);
  const [newMedName, setNewMedName] = useState('');
  const [newMedTime, setNewMedTime] = useState('');
  
  const [workoutPlan, setWorkoutPlan] = useState<{ plan: { day: string, activity: string }[], recommendation: string } | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [showToast, setShowToast] = useState<{ show: boolean, message: string, type: 'success' | 'warning' | 'info' } | null>(null);

  useEffect(() => {
    const today = new Date().toLocaleDateString();
    const saved = localStorage.getItem(`medcore_habits_${today}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      setWater(parsed.water);
      setWorkout(parsed.workout);
      setSleep(parsed.sleep);
    }
    
    const savedMeds = localStorage.getItem('medcore_meds');
    if (savedMeds) {
        setMedications(JSON.parse(savedMeds));
    }

    const savedPlan = localStorage.getItem('medcore_workout_plan');
    if (savedPlan) {
      setWorkoutPlan(JSON.parse(savedPlan));
    }
  }, []);

  useEffect(() => {
    const today = new Date().toLocaleDateString();
    localStorage.setItem(`medcore_habits_${today}`, JSON.stringify({ water, workout, sleep }));
    localStorage.setItem('medcore_meds', JSON.stringify(medications));
  }, [water, workout, sleep, medications]);

  useEffect(() => {
      const interval = setInterval(() => {
          const now = new Date();
          const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
          medications.forEach(med => {
              if (med.time === timeStr) {
                  setShowToast({ show: true, message: `Пора принять лекарство: ${med.name}`, type: 'warning' });
              }
          });
      }, 60000);
      return () => clearInterval(interval);
  }, [medications]);

  const addMedication = () => {
      if (!newMedName || !newMedTime) return;
      setMedications([...medications, { id: Date.now().toString(), name: newMedName, time: newMedTime }]);
      setNewMedName('');
      setNewMedTime('');
      setShowToast({ show: true, message: `Напоминание добавлено на ${newMedTime}`, type: 'success' });
  };

  const handleGeneratePlan = async () => {
    const metricsStr = localStorage.getItem('medcore_metrics');
    if (!metricsStr) return;
    const metrics: Metric[] = JSON.parse(metricsStr);
    
    setIsGeneratingPlan(true);
    try {
      const result = await generateWorkoutPlan(metrics);
      setWorkoutPlan(result);
      localStorage.setItem('medcore_workout_plan', JSON.stringify(result));
    } catch (error: any) {
      console.error(error);
      setWorkoutPlan({ recommendation: `Ошибка генерации: ${error.message || 'попробуйте позже'}`, plan: [] });
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const progress = [water, workout, sleep].filter(Boolean).length;
  const progressPercent = (progress / 3) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
      <div className="backdrop-blur-xl bg-slate-900/40 border border-white/10 rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        
        <h2 className="text-2xl font-bold mb-8 text-white flex items-center relative z-10">
          <div className="p-2 bg-teal-500/20 rounded-xl mr-4 border border-teal-500/30">
            <Activity className="w-6 h-6 text-teal-400" />
          </div>
          Ежедневный трекер
        </h2>
        
        <div className="mb-8 relative z-10">
          <div className="flex justify-between items-end mb-3">
            <span className="text-sm font-bold tracking-wider uppercase text-slate-400">Прогресс дня</span>
            <span className="text-xl font-bold text-white">{progress}<span className="text-slate-500 text-sm">/3</span></span>
          </div>
          <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/10 shadow-inner relative">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-teal-500 to-indigo-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(45,212,191,0.5)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="space-y-4 relative z-10">
          <button 
            onClick={() => setWater(!water)}
            className={`w-full p-5 rounded-2xl flex items-center justify-between border transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] ${
              water ? 'bg-teal-500/20 border-teal-500/40 shadow-[0_0_20px_rgba(20,184,166,0.15)]' : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-xl mr-5 transition-colors duration-300 ${water ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30' : 'bg-slate-800 text-teal-400 border border-white/10'}`}>
                <Droplet className="w-6 h-6" />
              </div>
              <span className={`font-bold text-lg ${water ? 'text-teal-300' : 'text-slate-300'}`}>2 Литра воды</span>
            </div>
            {water && <CheckCircle2 className="w-7 h-7 text-teal-400 drop-shadow animate-in zoom-in" />}
          </button>

          <button 
            onClick={() => setWorkout(!workout)}
            className={`w-full p-5 rounded-2xl flex items-center justify-between border transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] ${
              workout ? 'bg-orange-500/20 border-orange-500/40 shadow-[0_0_20px_rgba(249,115,22,0.15)]' : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-xl mr-5 transition-colors duration-300 ${workout ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-slate-800 text-orange-400 border border-white/10'}`}>
                <Dumbbell className="w-6 h-6" />
              </div>
              <span className={`font-bold text-lg ${workout ? 'text-orange-300' : 'text-slate-300'}`}>30 мин активности</span>
            </div>
            {workout && <CheckCircle2 className="w-7 h-7 text-orange-400 drop-shadow animate-in zoom-in" />}
          </button>

          <button 
            onClick={() => setSleep(!sleep)}
            className={`w-full p-5 rounded-2xl flex items-center justify-between border transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] ${
              sleep ? 'bg-indigo-500/20 border-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.15)]' : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-xl mr-5 transition-colors duration-300 ${sleep ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-800 text-indigo-400 border border-white/10'}`}>
                <Moon className="w-6 h-6" />
              </div>
              <span className={`font-bold text-lg ${sleep ? 'text-indigo-300' : 'text-slate-300'}`}>8 часов сна</span>
            </div>
            {sleep && <CheckCircle2 className="w-7 h-7 text-indigo-400 drop-shadow animate-in zoom-in" />}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
          <h3 className="font-bold text-slate-300 mb-4 flex items-center"><Calendar className="w-5 h-5 mr-2 text-indigo-400"/> Лекарства</h3>
          <div className="flex gap-2 mb-4">
              <input type="text" placeholder="Название" value={newMedName} onChange={(e) => setNewMedName(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white w-full"/>
              <input type="time" value={newMedTime} onChange={(e) => setNewMedTime(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white"/>
              <button onClick={addMedication} className="bg-indigo-600 text-white px-4 rounded-lg text-sm font-bold">+</button>
          </div>
          <div className="space-y-2">
              {medications.map(med => (
                  <div key={med.id} className="flex justify-between items-center bg-white/5 p-3 rounded-lg text-sm border border-white/5">
                      <span className="text-slate-200">{med.name} ({med.time})</span>
                      <button onClick={() => setMedications(medications.filter(m => m.id !== med.id))} className="text-rose-400 hover:text-rose-300">Удалить</button>
                  </div>
              ))}
          </div>
        </div>
        {showToast && <Toast {...showToast} onClose={() => setShowToast(null)} />}
      </div>

      <div className="backdrop-blur-xl bg-teal-900/20 border border-teal-500/20 shadow-[0_0_40px_-15px_rgba(45,212,191,0.3)] rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col h-full">
          <h2 className="text-2xl font-bold mb-6 flex items-center text-white">
            <div className="p-2 bg-teal-500/20 rounded-xl mr-4 border border-teal-500/30">
              <Sparkles className="w-6 h-6 text-teal-400" />
            </div>
            ИИ-План Тренировок
          </h2>
          
          <div className="flex-1 flex flex-col">
            {isGeneratingPlan ? (
              <div className="space-y-6 animate-in fade-in">
                <div className="h-6 bg-teal-500/20 rounded-lg w-3/4 animate-pulse"></div>
                <div className="h-4 bg-white/5 rounded-lg w-1/2 animate-pulse mb-8"></div>
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white/5 rounded-2xl p-5 border border-white/5 animate-pulse flex flex-col gap-3">
                      <div className="h-5 bg-teal-400/20 rounded-md w-1/4"></div>
                      <div className="h-4 bg-white/10 rounded-md w-full"></div>
                      <div className="h-4 bg-white/10 rounded-md w-5/6"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : workoutPlan ? (
              <div className="flex flex-col h-full animate-in slide-in-from-bottom-4 duration-500">
                <div className="bg-teal-500/10 border border-teal-500/20 p-5 rounded-2xl mb-6 shadow-inner">
                  <h4 className="text-teal-400 font-bold mb-2 flex items-center text-sm uppercase tracking-wider">
                    <Target className="w-4 h-4 mr-2" /> Рекомендация ИИ
                  </h4>
                  <p className="text-sm text-slate-200 leading-relaxed">{workoutPlan.recommendation}</p>
                </div>
                
                <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar pb-4 max-h-[350px]">
                  {workoutPlan.plan.map((p, idx) => (
                    <div key={idx} className="bg-white/5 rounded-2xl p-5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors group/card shadow-lg relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500/50 opacity-0 group-hover/card:opacity-100 transition-opacity" />
                      <h3 className="font-bold text-white text-lg mb-2 flex items-center">
                        <span className="w-8 h-8 rounded-xl bg-teal-500/20 flex items-center justify-center mr-3 text-sm text-teal-400 group-hover/card:scale-110 transition-transform border border-teal-500/30">
                          {idx + 1}
                        </span>
                        {p.day}
                      </h3>
                      <p className="text-sm text-slate-300 ml-11 leading-relaxed">{p.activity}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4 my-auto">
                <div className="bg-white/5 rounded-2xl p-5 border border-white/10 shadow-inner hover:bg-white/10 transition-colors">
                  <h3 className="font-bold text-teal-400 mb-2 flex items-center"><Droplet className="w-5 h-5 mr-2"/> Водный баланс</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">Пейте стакан воды сразу после пробуждения для запуска метаболизма и поддержания гидратации.</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-5 border border-white/10 shadow-inner hover:bg-white/10 transition-colors">
                  <h3 className="font-bold text-orange-400 mb-2 flex items-center"><Activity className="w-5 h-5 mr-2"/> Регулярность</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">Даже 15 минут быстрой ходьбы в день значительно снижают риск сердечно-сосудистых заболеваний.</p>
                </div>
                <div className="text-center mt-8 p-6 border border-teal-500/30 rounded-2xl bg-teal-500/5 backdrop-blur-sm">
                  <p className="text-sm text-teal-300 font-medium">Нажмите кнопку ниже, чтобы нейросеть проанализировала ваши показатели из журнала и составила персональный план тренировок.</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <button 
          onClick={handleGeneratePlan}
          disabled={isGeneratingPlan}
          className="mt-6 w-full py-4 bg-teal-500 hover:bg-teal-400 text-white rounded-2xl font-bold transition-all duration-300 hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none flex items-center justify-center text-lg relative z-10"
        >
          {isGeneratingPlan ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin mr-3" />
              Генерация ИИ-плана...
            </>
          ) : workoutPlan ? 'Перегенерировать план' : 'Составить ИИ-План на неделю'}
        </button>
      </div>
    </div>
  );
}
