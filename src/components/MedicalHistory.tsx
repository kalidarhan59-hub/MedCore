import React, { useState, useEffect } from 'react';
import { MedicalRecord } from '../types';
import { Clock, Activity, FileImage, Stethoscope, ChevronRight, X } from 'lucide-react';

export default function MedicalHistory() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Collect records from other parts of the app (localStorage)
    const allRecords: MedicalRecord[] = [];

    // 1. Triage chats
    const savedChat = localStorage.getItem('medcore_chat');
    if (savedChat) {
      const chats = JSON.parse(savedChat);
      chats.forEach((msg: any) => {
        if (msg.role === 'ai' && msg.risk) {
          allRecords.push({
            id: msg.id,
            date: new Date(Number(msg.id)).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
            type: 'triage',
            title: 'Анализ симптомов (Триаж)',
            description: msg.text,
            severity: msg.risk === 'HIGH' ? 'danger' : msg.risk === 'MEDIUM' ? 'warning' : 'normal'
          });
        }
      });
    }

    // 2. Add some dummy image records if none exist, or load from LS
    // For demo purposes, we will mock a few if the timeline is empty
    if (allRecords.length === 0) {
      allRecords.push({
        id: 'mock1',
        date: new Date().toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
        type: 'triage',
        title: 'Первичная консультация',
        description: 'Жалобы на головную боль и слабость. Рекомендован покой и обильное питье.',
        severity: 'normal'
      });
    }

    setRecords(allRecords.sort((a, b) => b.id.localeCompare(a.id))); // Sort by ID (timestamp)
  }, []);

  const filteredRecords = records.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.date.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getIcon = (type: string) => {
    switch (type) {
      case 'triage': return <Stethoscope className="w-5 h-5 text-indigo-400" />;
      case 'image': return <FileImage className="w-5 h-5 text-purple-400" />;
      case 'metric': return <Activity className="w-5 h-5 text-teal-400" />;
      default: return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'danger': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'warning': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
    }
  };

  const getSeverityLabel = (severity?: string) => {
    switch (severity) {
      case 'danger': return 'ВЫСОКИЙ РИСК';
      case 'warning': return 'ТРЕБУЕТ ВНИМАНИЯ';
      default: return 'НОРМА';
    }
  };

  return (
    <div className="space-y-6 relative h-full">
      <div className="backdrop-blur-xl bg-slate-900/40 border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl min-h-[80vh]">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center">
            <div className="p-2 bg-indigo-500/20 rounded-xl mr-4 border border-indigo-500/30">
              <Clock className="w-6 h-6 text-indigo-400" />
            </div>
            Электронная Медкарта
          </h2>
          <p className="text-slate-400 mb-6">Хронологическая история ваших симптомов, анализов и метрик.</p>
          
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по истории..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-6 text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-500"
          />
        </div>

        <div className="relative border-l-2 border-white/10 ml-6 space-y-8 pb-10">
          {filteredRecords.length === 0 && (
            <p className="text-slate-500 pl-8 italic">Записей не найдено.</p>
          )}
          
          {filteredRecords.map((record) => (
            <div key={record.id} className="relative pl-8 group animate-in slide-in-from-left-4 duration-500">
              {/* Timeline dot */}
              <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-slate-900 border-2 border-indigo-500 flex items-center justify-center group-hover:scale-125 transition-transform duration-300">
                <div className="w-2 h-2 rounded-full bg-indigo-400" />
              </div>
              
              <div className="backdrop-blur-md bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-white/5 rounded-lg">
                        {getIcon(record.type)}
                      </div>
                      <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">{record.title}</h3>
                      {record.severity && (
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md border tracking-wider ${getSeverityColor(record.severity)}`}>
                          {getSeverityLabel(record.severity)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 font-mono mb-3">{record.date}</p>
                    <p className="text-slate-300 text-sm line-clamp-2">{record.description}</p>
                  </div>
                  
                  <button 
                    onClick={() => setSelectedRecord(record)}
                    className="shrink-0 flex items-center px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium text-indigo-300 transition-colors hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Подробнее <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Record Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f172a]/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  {getIcon(selectedRecord.type)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedRecord.title}</h3>
                  <p className="text-sm text-slate-400">{selectedRecord.date}</p>
                </div>
              </div>
              <button onClick={() => setSelectedRecord(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
              {selectedRecord.severity && (
                <div className={`mb-6 p-4 rounded-2xl border ${getSeverityColor(selectedRecord.severity)}`}>
                  <p className="font-bold mb-1">Уровень внимания:</p>
                  <p className="text-sm opacity-90">{getSeverityLabel(selectedRecord.severity)}</p>
                </div>
              )}
              
              {selectedRecord.imageUrl && (
                <div className="mb-6">
                  <img src={selectedRecord.imageUrl} alt="Medical Attachment" className="w-full max-h-64 object-contain rounded-xl border border-white/10 bg-black/20" />
                </div>
              )}
              
              <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                <h4 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Детали записи</h4>
                <div className="text-slate-200 text-sm whitespace-pre-wrap leading-relaxed">
                  {selectedRecord.description}
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-white/5 bg-slate-900/50 flex justify-end gap-3">
              <button 
                onClick={() => window.print()}
                className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Распечатать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
