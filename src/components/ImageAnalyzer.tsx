import React, { useState, useRef } from 'react';
import { UploadCloud, FileImage, Loader2, AlertCircle, ScanLine } from 'lucide-react';
import { analyzeImage } from '../services/geminiService';

export default function ImageAnalyzer() {
  const [image, setImage] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
      setResult(null); // Reset previous result
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setIsLoading(true);
    try {
      const res = await analyzeImage(image, comment);
      setResult(res.analysis);
      
      // Save record to Medical History
      const recordsStr = localStorage.getItem('medcore_history') || '[]';
      let records = [];
      try { records = JSON.parse(recordsStr); } catch(e){}
      
      records.push({
        id: Date.now().toString(),
        date: new Date().toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
        type: 'image',
        title: 'Анализ медицинского изображения',
        description: res.analysis.substring(0, 300) + '...',
        imageUrl: image,
      });
      localStorage.setItem('medcore_history', JSON.stringify(records));
      
    } catch (error: any) {
      console.error(error);
      setResult(`Ошибка при анализе изображения: ${error.message || 'попробуйте позже'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="backdrop-blur-xl bg-slate-900/40 border border-white/10 rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 max-w-3xl mx-auto shadow-2xl animate-in fade-in duration-500">
      <h2 className="text-3xl font-bold mb-8 text-white flex items-center">
        <div className="p-2 bg-indigo-500/20 rounded-xl mr-4 border border-indigo-500/30">
          <FileImage className="w-8 h-8 text-indigo-400" />
        </div>
        Мультимодальный Анализ
      </h2>

      <div 
        className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all duration-300 relative overflow-hidden group shadow-inner ${
          image ? 'bg-white/5 border-white/10' : 'bg-indigo-500/5 border-indigo-500/30 hover:bg-indigo-500/10 cursor-pointer hover:border-indigo-500/60'
        }`}
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => !image && fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*"
        />
        
        {image ? (
          <div className="relative group/img animate-in zoom-in-95 duration-500">
            <div className="relative inline-block overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
              <img src={image} alt="Preview" className="max-h-80 object-contain block" />
              
              {/* Neon Scan Line Animation */}
              {isLoading && (
                <div className="absolute top-0 left-0 w-full h-[3px] bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,1)] animate-[scan_2s_ease-in-out_infinite]" />
              )}
            </div>

            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center rounded-2xl backdrop-blur-sm">
              <button 
                onClick={(e) => { e.stopPropagation(); setImage(null); setResult(null); }}
                disabled={isLoading}
                className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl font-bold shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                Удалить фото
              </button>
            </div>
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center">
            <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-500 shadow-inner">
              <UploadCloud className="w-12 h-12 text-indigo-400 drop-shadow" />
            </div>
            <p className="text-white font-bold text-xl mb-2">Перетащите снимок сюда</p>
            <p className="text-slate-400">или нажмите для выбора файла (JPG, PNG)</p>
          </div>
        )}
      </div>

      {image && !result && (
        <div className="mt-8 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-3 ml-1 uppercase tracking-wider">Сопутствующие жалобы</label>
            <textarea 
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Например: Родинка поменяла цвет и стала чесаться..."
              className="w-full px-6 py-5 bg-white/5 border border-white/10 text-white placeholder:text-slate-500 rounded-3xl outline-none focus:border-indigo-500 focus:bg-white/10 resize-none transition-all duration-300 shadow-inner"
              rows={3}
              disabled={isLoading}
            />
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={isLoading}
            className="w-full py-5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-3xl font-bold transition-all duration-300 hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none flex items-center justify-center text-xl"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin mr-3" /> 
                Идет нейросетевой анализ...
              </>
            ) : (
              <>
                <ScanLine className="w-6 h-6 mr-3" />
                Запустить ИИ-Анализ
              </>
            )}
          </button>
        </div>
      )}

      {result && (
        <div className="mt-8 p-8 md:p-10 bg-white/5 rounded-3xl border border-indigo-500/30 shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-8 duration-700">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
          
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center border-b border-white/10 pb-4">
             <span className="bg-indigo-500/20 p-2 rounded-xl mr-3 border border-indigo-500/30 shadow-inner">🧬</span>
             Результат анализа
          </h3>
          
          <div className="text-slate-200 whitespace-pre-wrap leading-relaxed text-base relative z-10 font-medium mb-8">
            {result}
          </div>

          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6 flex items-start text-rose-400 shadow-inner">
            <AlertCircle className="w-8 h-8 mr-4 shrink-0" />
            <div>
              <h4 className="font-bold text-rose-400 mb-1 tracking-wider uppercase text-sm">НЕ ЯВЛЯЕТСЯ ДИАГНОЗОМ</h4>
              <p className="text-sm font-medium opacity-90 leading-relaxed">
                Результаты ИИ-анализа носят исключительно информационный характер и не заменяют профессиональную медицинскую консультацию. Обязательно обратитесь к врачу для постановки точного диагноза.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
