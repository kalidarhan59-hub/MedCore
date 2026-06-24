import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Metric } from '../types';
import { analyzeMetrics } from '../services/geminiService';
import { Activity, Heart, Moon, Brain, Loader2, Download, Info, CheckCircle, TrendingUp } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Toast from './Toast';

const SYMPTOMS = ["Головная боль", "Головокружение", "Усталость", "Боль в груди", "Одышка", "Тошнота"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="backdrop-blur-xl bg-slate-900/90 border border-white/20 p-5 rounded-2xl shadow-2xl">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">{label}</p>
        <div className="space-y-2">
          <p className="text-teal-400 font-bold text-sm flex items-center justify-between gap-4">
            <span>Систолическое:</span> <span>{payload[0].value}</span>
          </p>
          <p className="text-indigo-400 font-bold text-sm flex items-center justify-between gap-4">
            <span>Диастолическое:</span> <span>{payload[1].value}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default function MetricsDashboard() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [pulse, setPulse] = useState('');
  const [sleep, setSleep] = useState('');
  
  const [aiSummary, setAiSummary] = useState<{ status: string, trend: string, tip: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('medcore_metrics');
    if (saved) {
      let parsed: Metric[] = JSON.parse(saved);
      if (parsed.length > 0) {
        const uniqueDates = new Set(parsed.map(p => p.date));
        if (uniqueDates.size <= 1 && parsed.length > 1) {
          const today = new Date();
          parsed = parsed.map((m, i) => {
            const d = new Date(today);
            d.setDate(d.getDate() - (parsed.length - 1 - i));
            return { ...m, date: d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) };
          });
          localStorage.setItem('medcore_metrics', JSON.stringify(parsed));
        }
      }
      setMetrics(parsed);
    }
  }, []);

  const saveMetrics = (newMetrics: Metric[]) => {
    setMetrics(newMetrics);
    localStorage.setItem('medcore_metrics', JSON.stringify(newMetrics));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!systolic || !diastolic || !pulse || !sleep) return;
    
    setIsSaving(true);
    setTimeout(() => {
      const today = new Date();
      const newMetric: Metric = {
        id: Date.now().toString(),
        date: today.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
        systolic: Number(systolic),
        diastolic: Number(diastolic),
        pulse: Number(pulse),
        sleep: Number(sleep),
        symptoms: selectedSymptoms
      };
      
      saveMetrics([...metrics, newMetric]);
      
      // Save to global history
      const historyStr = localStorage.getItem('medcore_history') || '[]';
      let history = [];
      try { history = JSON.parse(historyStr); } catch(e){}
      history.push({
        id: Date.now().toString(),
        date: today.toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
        type: 'metrics',
        title: 'Обновление показателей здоровья',
        description: `Давление: ${systolic}/${diastolic}, Пульс: ${pulse}, Сон: ${sleep}ч, Симптомы: ${selectedSymptoms.join(', ')}`,
      });
      localStorage.setItem('medcore_history', JSON.stringify(history));

      setSystolic('');
      setDiastolic('');
      setPulse('');
      setSleep('');
      setSelectedSymptoms([]);
      setIsSaving(false);
      
      setShowToast(true);
    }, 600);
  };

  const handleAiAnalyze = async () => {
    if (metrics.length === 0) return;
    setIsLoading(true);
    try {
      const summary = await analyzeMetrics(metrics);
      setAiSummary(summary);
    } catch (error: any) {
      console.error(error);
      setAiSummary({ status: 'Ошибка', trend: '-', tip: `Сбой связи с ИИ: ${error.message || 'попробуйте позже'}` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Отчет по метрикам здоровья', 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Сгенерировано: ${new Date().toLocaleDateString('ru-RU')}`, 14, 30);
    
    if (aiSummary) {
      doc.text('AI Резюме:', 14, 40);
      doc.text(`Статус: ${aiSummary.status}`, 14, 48);
      doc.text(`Тренд: ${aiSummary.trend}`, 14, 56);
      doc.text(`Совет: ${aiSummary.tip}`, 14, 64);
    }

    const startY = aiSummary ? 74 : 40;
    
    const tableColumn = ["Дата", "Давление (верх/ниж)", "Пульс (уд/мин)", "Сон (часы)"];
    const tableRows = metrics.map(m => [
      m.date,
      `${m.systolic} / ${m.diastolic}`,
      m.pulse.toString(),
      m.sleep.toString()
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: startY,
      theme: 'grid',
      styles: { font: 'helvetica', fontSize: 10 },
      headStyles: { fillColor: [45, 212, 191] }
    });

    doc.save('health_metrics_report.pdf');
  };

  const isFormValid = systolic && diastolic && pulse && sleep;

  return (
    <div className="space-y-6 relative animate-in fade-in duration-500">
      {/* Toast Notification */}
      <div className={`fixed top-4 right-4 z-50 transition-all duration-500 transform ${showToast ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'}`}>
        <div className="backdrop-blur-xl bg-teal-500/90 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center border border-teal-400/50 font-bold">
          <CheckCircle className="w-6 h-6 mr-3" />
          Показатели успешно сохранены
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form */}
        <div className="backdrop-blur-xl bg-slate-900/40 border border-white/10 rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <h2 className="text-2xl font-bold mb-6 text-white flex items-center">
            <div className="p-2 bg-teal-500/20 rounded-xl mr-3 border border-teal-500/30">
              <Activity className="w-6 h-6 text-teal-400" />
            </div>
            Ввод показателей
          </h2>
          
          <form onSubmit={handleAdd} className="space-y-5 relative z-10">
            <div className="grid grid-cols-2 gap-5">
              <div className="relative group/input">
                <label className="block text-xs font-bold tracking-wider uppercase text-slate-400 mb-2 flex items-center">
                  Систолическое
                  <Info className="w-4 h-4 ml-1.5 text-slate-500 group-hover/input:text-teal-400 transition-colors" />
                </label>
                <div className="absolute opacity-0 group-hover/input:opacity-100 transition-opacity bottom-full mb-2 left-0 w-max bg-slate-800 text-xs text-white p-3 rounded-xl z-20 pointer-events-none shadow-xl border border-white/10 font-medium">
                  Норма систолического давления: 110-130
                </div>
                <input required type="number" value={systolic} onChange={e => setSystolic(e.target.value)} className={`w-full px-5 py-3.5 bg-white/5 border text-white placeholder:text-slate-600 rounded-2xl outline-none transition-all duration-300 focus:bg-white/10 ${!systolic ? 'border-red-500/30 focus:border-red-500/50' : 'border-white/10 focus:border-teal-500 shadow-inner'}`} placeholder="120" />
              </div>
              <div className="relative group/input">
                <label className="block text-xs font-bold tracking-wider uppercase text-slate-400 mb-2 flex items-center">
                  Диастолическое
                  <Info className="w-4 h-4 ml-1.5 text-slate-500 group-hover/input:text-teal-400 transition-colors" />
                </label>
                <div className="absolute opacity-0 group-hover/input:opacity-100 transition-opacity bottom-full mb-2 left-0 w-max bg-slate-800 text-xs text-white p-3 rounded-xl z-20 pointer-events-none shadow-xl border border-white/10 font-medium">
                  Норма диастолического давления: 70-85
                </div>
                <input required type="number" value={diastolic} onChange={e => setDiastolic(e.target.value)} className={`w-full px-5 py-3.5 bg-white/5 border text-white placeholder:text-slate-600 rounded-2xl outline-none transition-all duration-300 focus:bg-white/10 ${!diastolic ? 'border-red-500/30 focus:border-red-500/50' : 'border-white/10 focus:border-teal-500 shadow-inner'}`} placeholder="80" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-5">
              <div className="relative group/input">
                <label className="block text-xs font-bold tracking-wider uppercase text-slate-400 mb-2 flex items-center">
                  <Heart className="w-4 h-4 mr-1.5 text-rose-400"/> Пульс
                  <Info className="w-4 h-4 ml-1.5 text-slate-500 group-hover/input:text-rose-400 transition-colors" />
                </label>
                <div className="absolute opacity-0 group-hover/input:opacity-100 transition-opacity bottom-full mb-2 left-0 w-max bg-slate-800 text-xs text-white p-3 rounded-xl z-20 pointer-events-none shadow-xl border border-white/10 font-medium">
                  Норма пульса: 60-100 уд/мин
                </div>
                <input required type="number" value={pulse} onChange={e => setPulse(e.target.value)} className={`w-full px-5 py-3.5 bg-white/5 border text-white placeholder:text-slate-600 rounded-2xl outline-none transition-all duration-300 focus:bg-white/10 ${!pulse ? 'border-red-500/30 focus:border-red-500/50' : 'border-white/10 focus:border-teal-500 shadow-inner'}`} placeholder="72" />
              </div>
              <div className="relative group/input">
                <label className="block text-xs font-bold tracking-wider uppercase text-slate-400 mb-2 flex items-center">
                  <Moon className="w-4 h-4 mr-1.5 text-indigo-400"/> Сон (часы)
                  <Info className="w-4 h-4 ml-1.5 text-slate-500 group-hover/input:text-indigo-400 transition-colors" />
                </label>
                <div className="absolute opacity-0 group-hover/input:opacity-100 transition-opacity bottom-full mb-2 left-0 w-max bg-slate-800 text-xs text-white p-3 rounded-xl z-20 pointer-events-none shadow-xl border border-white/10 font-medium">
                  Рекомендуется 7-9 часов сна
                </div>
                <input required type="number" value={sleep} onChange={e => setSleep(e.target.value)} className={`w-full px-5 py-3.5 bg-white/5 border text-white placeholder:text-slate-600 rounded-2xl outline-none transition-all duration-300 focus:bg-white/10 ${!sleep ? 'border-red-500/30 focus:border-red-500/50' : 'border-white/10 focus:border-teal-500 shadow-inner'}`} placeholder="8" />
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-xs font-bold tracking-wider uppercase text-slate-400 mb-2">Симптомы</label>
              <div className="flex flex-wrap gap-2">
                {SYMPTOMS.map(symptom => (
                  <button 
                    key={symptom} 
                    type="button"
                    onClick={() => setSelectedSymptoms(prev => prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom])}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${selectedSymptoms.includes(symptom) ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={!isFormValid || isSaving}
              className="w-full mt-2 py-4 bg-teal-500 hover:bg-teal-400 text-white rounded-2xl font-bold transition-all duration-300 hover:shadow-[0_0_20px_rgba(20,184,166,0.4)] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none flex items-center justify-center text-lg"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin mr-3" />
                  Сохранение...
                </>
              ) : 'Записать в журнал'}
            </button>
          </form>
        </div>

        {/* AI Summary */}
        <div className="backdrop-blur-xl bg-indigo-900/30 rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 border border-indigo-500/20 shadow-[0_0_40px_-15px_rgba(99,102,241,0.3)] flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          {isLoading && (
            <div className="absolute inset-0 bg-indigo-900/80 flex flex-col items-center justify-center backdrop-blur-md z-20">
              <div className="flex space-x-2 mb-4">
                <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <p className="text-indigo-200 text-sm font-bold animate-pulse tracking-wide uppercase">Анализ нейросетью...</p>
            </div>
          )}
          
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center">
              <div className="p-2 bg-indigo-500/20 rounded-xl mr-3 border border-indigo-500/30">
                <Brain className="w-6 h-6 text-indigo-400" />
              </div>
              AI Резюме здоровья
            </h2>
            
            {aiSummary ? (
              <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-start shadow-inner">
                  <div className="p-2 bg-teal-500/20 rounded-xl mr-4 border border-teal-500/30 shrink-0">
                    <Activity className="w-5 h-5 text-teal-400" />
                  </div>
                  <div>
                    <strong className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Статус</strong>
                    <span className="text-base text-slate-200 font-medium">{aiSummary.status}</span>
                  </div>
                </div>
                
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-start shadow-inner">
                  <div className="p-2 bg-indigo-500/20 rounded-xl mr-4 border border-indigo-500/30 shrink-0">
                    <TrendingUp className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <strong className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Тренд</strong>
                    <span className="text-base text-slate-200 font-medium">{aiSummary.trend}</span>
                  </div>
                </div>
                
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-start shadow-inner">
                  <div className="p-2 bg-amber-500/20 rounded-xl mr-4 border border-amber-500/30 shrink-0">
                    <Brain className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <strong className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Рекомендация</strong>
                    <span className="text-base text-slate-200 font-medium leading-relaxed">{aiSummary.tip}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 px-4 bg-white/[0.02] rounded-3xl border border-white/5 border-dashed">
                <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4">
                  <Brain className="w-8 h-8 text-indigo-400/50" />
                </div>
                <p className="text-slate-400 text-center font-medium">Нейросеть проанализирует ваши показатели и даст персонализированные рекомендации.</p>
              </div>
            )}
          </div>

          <button 
            onClick={handleAiAnalyze}
            disabled={metrics.length === 0 || isLoading}
            className="mt-6 w-full py-4 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/40 hover:text-white rounded-2xl font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center text-lg relative z-10 shadow-lg"
          >
            Получить инсайт от ИИ
          </button>
        </div>
      </div>

      {/* Chart */}
      {metrics.length > 0 && (
        <div className="backdrop-blur-xl bg-slate-900/40 border border-white/10 rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 h-96 flex flex-col shadow-2xl animate-in slide-in-from-bottom-8 duration-700">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <TrendingUp className="w-6 h-6 mr-3 text-teal-400" />
              Динамика давления
            </h2>
            <button 
              onClick={handleExportPDF}
              className="flex items-center px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-slate-200 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-inner"
            >
              <Download className="w-4 h-4 mr-2" />
              Экспорт PDF
            </button>
          </div>
          
          <ResponsiveContainer width="100%" height="100%" className="flex-1">
            <AreaChart data={metrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSystolic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDiastolic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b', fontWeight: 600}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b', fontWeight: 600}} dx={-10} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#475569', strokeWidth: 1, strokeDasharray: '3 3' }} />
              <Area type="monotone" dataKey="systolic" stroke="#2dd4bf" strokeWidth={3} fillOpacity={1} fill="url(#colorSystolic)" animationDuration={1500} />
              <Area type="monotone" dataKey="diastolic" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorDiastolic)" animationDuration={1500} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
