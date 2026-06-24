import React, { useState, useEffect } from 'react';
import { Doctor, Review } from '../types';
import { Star, X, MessageSquare, Award, Clock, Loader2, Heart } from 'lucide-react';

const DOCTORS: Doctor[] = [
  { 
    id: '1', 
    name: 'Эдвард Дженнер', 
    specialization: 'Эпидемиолог, Иммунолог', 
    rating: 5.0, 
    description: 'Английский врач, разработавший первую в мире вакцину — вакцину против натуральной оспы.',
    achievements: ['Создание первой вакцины', 'Спасение человечества от эпидемий оспы'],
    contribution: 'Открыл эру иммунизации, что в конечном итоге привело к полному искоренению натуральной оспы на Земле.',
    reviews: [{ id: '1-1', text: 'Спасибо за вакцинацию!', rating: 5, date: '1800-01-01' }] 
  },
  { 
    id: '2', 
    name: 'Александр Флеминг', 
    specialization: 'Микробиолог', 
    rating: 4.9, 
    description: 'Британский бактериолог, открывший лизоцим и впервые выделивший пенициллин из плесневых грибов.',
    achievements: ['Открытие пенициллина (1928)', 'Нобелевская премия по физиологии и медицине'],
    contribution: 'Положил начало эре антибиотиков, спасших сотни миллионов жизней от бактериальных инфекций.',
    reviews: [{ id: '2-1', text: 'Пенициллин спас моего прадеда.', rating: 5, date: '1945-05-09' }] 
  },
  { 
    id: '3', 
    name: 'Джонас Солк', 
    specialization: 'Вирусолог', 
    rating: 5.0, 
    description: 'Американский исследователь, разработавший первую успешную инактивированную вакцину против полиомиелита.',
    achievements: ['Создание полиомиелитной вакцины', 'Отказ от патентования ради доступности'],
    contribution: 'Победил эпидемию полиомиелита, отказавшись от миллиардов долларов, чтобы вакцина была доступна всем детям мира.',
    reviews: [{ id: '3-1', text: 'Настоящий герой человечества.', rating: 5, date: '1955-04-12' }] 
  },
  { 
    id: '4', 
    name: 'Рене Лаэннек', 
    specialization: 'Терапевт', 
    rating: 4.8, 
    description: 'Французский врач и анатом, основоположник клинико-анатомического метода в медицине.',
    achievements: ['Изобретение стетоскопа', 'Описание туберкулеза, цирроза печени'],
    contribution: 'Изобрел стетоскоп (1816), что позволило врачам точно диагностировать болезни сердца и легких без непосредственного прикладывания уха к груди.',
    reviews: [{ id: '4-1', text: 'Без стетоскопа мы бы работали вслепую.', rating: 5, date: '1820-10-10' }] 
  },
  { 
    id: '5', 
    name: 'Гиппократ', 
    specialization: 'Отец медицины', 
    rating: 5.0, 
    description: 'Древнегреческий врач, вошедший в историю как «отец медицины». Вывел медицину из рамок религии и философии.',
    achievements: ['Клятва Гиппократа', 'Учение о темпераментах', 'Клиническое наблюдение'],
    contribution: 'Заложил морально-этические основы профессии врача и принцип «Не навреди», которые актуальны до сих пор.',
    reviews: [{ id: '5-1', text: 'Клянусь Аполлоном, великий человек!', rating: 5, date: '400 BC' }] 
  },
];

export default function DoctorsList() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedReviews = localStorage.getItem('medcore_doctors_data_v2');
    if (savedReviews) {
      setDoctors(JSON.parse(savedReviews));
    } else {
      setDoctors(DOCTORS);
    }
  }, []);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor || !reviewText.trim()) return;
    
    setIsSubmitting(true);

    setTimeout(() => {
      const newReview: Review = {
        id: Date.now().toString(),
        text: reviewText,
        rating,
        date: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
      };

      const newReviews = [newReview, ...selectedDoctor.reviews];
      const newRating = newReviews.reduce((acc, r) => acc + r.rating, 0) / newReviews.length;
      
      const updatedDoctor = { ...selectedDoctor, reviews: newReviews, rating: Number(newRating.toFixed(1)) };
      
      const newDoctorsList = doctors.map(d => d.id === updatedDoctor.id ? updatedDoctor : d);
      setDoctors(newDoctorsList);
      localStorage.setItem('medcore_doctors_data_v2', JSON.stringify(newDoctorsList));
      setSelectedDoctor(updatedDoctor);
      setReviewText('');
      setRating(5);
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
              <Award className="w-6 h-6 text-indigo-400" />
            </div>
            Сообщество Великих Врачей
          </h2>
          <p className="text-slate-400 font-medium ml-14">Вдохновляющие личности, изменившие ход истории медицины</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {doctors.map(doctor => (
          <div 
            key={doctor.id} 
            onClick={() => setSelectedDoctor(doctor)}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 cursor-pointer hover:bg-white/10 transition-all duration-300 group hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.3)] flex flex-col h-full overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex-1 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/40 to-purple-500/20 border border-white/10 flex items-center justify-center text-2xl mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-inner">
                ⚕️
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">{doctor.name}</h3>
              <p className="text-sm font-medium text-slate-400 mb-5 leading-relaxed">{doctor.specialization}</p>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-white/5 relative z-10">
              <div className="flex items-center text-sm font-bold text-amber-400 bg-amber-400/10 px-2 py-1 rounded-lg">
                <Star className="w-4 h-4 mr-1 fill-amber-400 drop-shadow-sm" />
                {doctor.rating}
              </div>
              <div className="flex items-center text-xs text-indigo-300 font-medium bg-indigo-500/10 px-2.5 py-1.5 rounded-lg border border-indigo-500/20">
                <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                {doctor.reviews.length}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0f172a]/80 backdrop-blur-md transition-all">
          <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl w-full max-w-4xl shadow-[0_0_50px_-12px_rgba(99,102,241,0.5)] overflow-hidden flex flex-col sm:flex-row max-h-[90vh] animate-in zoom-in-95 duration-300">
            
            {/* Modal Left / Top Header Info */}
            <div className="relative p-8 border-b sm:border-b-0 sm:border-r border-white/10 sm:w-2/5 flex flex-col justify-between overflow-hidden bg-white/[0.02]">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/20 to-transparent -z-10" />
              
              <button 
                onClick={() => setSelectedDoctor(null)} 
                className="absolute top-4 right-4 sm:hidden p-2 bg-white/10 rounded-full text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-white/20 flex items-center justify-center text-4xl shadow-xl shrink-0 mb-6">
                  ⚕️
                </div>
                <h3 className="text-3xl font-bold text-white mb-3 leading-tight">{selectedDoctor.name}</h3>
                <p className="text-indigo-300 font-medium mb-6 text-lg">{selectedDoctor.specialization}</p>
                
                <p className="text-slate-300 text-sm leading-relaxed mb-6">{selectedDoctor.description}</p>
                
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 mb-6 shadow-inner">
                  <h4 className="text-indigo-400 font-bold mb-3 flex items-center text-sm uppercase tracking-wider">
                    <Heart className="w-4 h-4 mr-2" /> Вклад в человечество
                  </h4>
                  <p className="text-slate-200 text-sm italic">"{selectedDoctor.contribution}"</p>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-auto pt-6 border-t border-white/10">
                <div className="flex items-center font-bold text-amber-400 bg-amber-400/10 px-3 py-2 rounded-xl">
                  <Star className="w-5 h-5 mr-1.5 fill-amber-400 drop-shadow" />
                  {selectedDoctor.rating}
                </div>
                <div className="flex items-center font-medium text-slate-400 bg-white/5 px-3 py-2 rounded-xl border border-white/10">
                  <Award className="w-5 h-5 mr-1.5 text-indigo-400" />
                  Легенда
                </div>
              </div>
            </div>
            
            {/* Modal Right / Body (Reviews) */}
            <div className="flex-1 flex flex-col bg-slate-900/50 relative">
              <button 
                onClick={() => setSelectedDoctor(null)} 
                className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 hover:rotate-90 rounded-full transition-all text-slate-300 z-10 hidden sm:block"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8 pb-4">
                <h4 className="text-xl font-bold text-white flex items-center">
                  <MessageSquare className="w-5 h-5 mr-3 text-indigo-400" /> 
                  Отзывы ({selectedDoctor.reviews.length})
                </h4>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar px-8 pb-8 space-y-6">
                
                {/* Review Form */}
                <form onSubmit={handleSubmitReview} className="bg-white/5 p-6 rounded-3xl border border-white/10 relative overflow-hidden shadow-inner group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full" />
                  <h4 className="font-bold text-slate-200 mb-4 text-sm uppercase tracking-wider">Оставить свой отзыв</h4>
                  
                  <div className="flex items-center mb-4 bg-slate-900/50 inline-flex p-1.5 rounded-2xl border border-white/5">
                    <div className="flex px-2">
                      {[1,2,3,4,5].map(s => (
                        <button 
                          key={s} 
                          type="button" 
                          onClick={() => setRating(s)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star className={`w-7 h-7 ${s <= rating ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]' : 'text-slate-600'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <textarea
                    required
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    placeholder="Ваше восхищение..."
                    className="w-full px-5 py-4 bg-slate-900/50 border border-white/10 text-white placeholder:text-slate-500 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white/5 mb-4 resize-none transition-all duration-300 shadow-inner"
                    rows={3}
                  />
                  
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-bold transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Опубликовать'}
                  </button>
                </form>

                {/* Reviews List */}
                <div className="space-y-4">
                  {selectedDoctor.reviews.map((rev) => (
                    <div key={rev.id} className="bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors animate-in slide-in-from-bottom-2">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
                          ))}
                        </div>
                        <span className="text-xs text-slate-500 font-mono">{rev.date}</span>
                      </div>
                      <p className="text-slate-300 text-sm leading-relaxed">"{rev.text}"</p>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
