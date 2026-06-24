import React, { useState, useEffect } from 'react';
import { UserProfile } from './types';
import Auth from './components/Auth';
import SymptomChecker from './components/SymptomChecker';
import MetricsDashboard from './components/MetricsDashboard';
import ImageAnalyzer from './components/ImageAnalyzer';
import LifestyleSport from './components/LifestyleSport';
import DoctorsList from './components/DoctorsList';
import MedicalHistory from './components/MedicalHistory';
import { Activity, Stethoscope, Image as ImageIcon, CheckSquare, Users, LogOut, Clock, Sun, Moon, User } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('triage');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('medcore_user');
    if (saved) {
      setUser(JSON.parse(saved));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('medcore_user');
    setUser(null);
  };

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  const tabs = [
    { id: 'triage', label: user.role === 'patient' ? 'Умный Триаж' : 'Ассистент ИИ', icon: <Stethoscope className="w-5 h-5" /> },
    { id: 'metrics', label: 'Метрики', icon: <Activity className="w-5 h-5" /> },
    { id: 'images', label: 'Анализ снимков', icon: <ImageIcon className="w-5 h-5" /> },
    { id: 'lifestyle', label: 'Привычки', icon: <CheckSquare className="w-5 h-5" /> },
    { id: 'doctors', label: 'Врачи', icon: <Users className="w-5 h-5" /> },
    { id: 'history', label: 'Медкарта', icon: <Clock className="w-5 h-5" /> },
  ];

  const renderContent = () => {
    if (showProfile) {
      return (
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6">Профиль</h2>
          <div className="space-y-4 text-slate-300">
            <p><strong>Имя:</strong> {user.name}</p>
            <p><strong>Роль:</strong> {user.role}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </div>
          <button onClick={() => setShowProfile(false)} className="mt-6 px-4 py-2 bg-indigo-500 rounded-xl text-white font-bold">Назад</button>
        </div>
      );
    }
    switch (activeTab) {
      case 'triage': return <SymptomChecker user={user} />;
      case 'metrics': return <MetricsDashboard />;
      case 'images': return <ImageAnalyzer />;
      case 'lifestyle': return <LifestyleSport />;
      case 'doctors': return <DoctorsList />;
      case 'history': return <MedicalHistory />;
      default: return null;
    }
  };

  const themeClass = user.role === 'patient' ? 'bg-teal-600/30' : 'bg-indigo-600/30';
  const activeTabClass = user.role === 'patient' 
    ? 'bg-white/10 text-teal-400 border border-white/10 shadow-[0_0_15px_rgba(45,212,191,0.2)]' 
    : 'bg-white/10 text-indigo-400 border border-white/10 shadow-[0_0_15px_rgba(99,102,241,0.2)]';
  const avatarClass = user.role === 'patient' ? 'bg-teal-500 shadow-lg shadow-teal-500/20' : 'bg-indigo-500 shadow-lg shadow-indigo-500/20';

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0f172a] text-slate-200' : 'bg-slate-50 text-slate-800'} font-sans selection:bg-teal-500/30 relative flex flex-col`}>
      {/* Background blobs for glassmorphism effect */}
      <div className={`fixed inset-0 pointer-events-none z-0 overflow-hidden ${isDarkMode ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-[#0f172a]' : 'bg-slate-50'}`}>
        <div className={`absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full blur-[120px] transition-colors duration-1000 ${themeClass}`} />
        <div className={`absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full blur-[120px] transition-colors duration-1000 ${user.role === 'patient' ? 'bg-indigo-600/20' : 'bg-purple-600/20'}`} />
        {/* Mesh background overlay */}
        {isDarkMode && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02]" />}
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 min-h-screen">
        
        {/* Sidebar */}
        <aside className="md:w-72 shrink-0 flex flex-col">
          <div className={`backdrop-blur-xl ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/80 border-slate-200'} border rounded-3xl p-6 md:p-8 sticky top-8 shadow-2xl flex-1 flex flex-col`}>
            <div className="mb-8">
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} tracking-tight flex items-center gap-3`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${avatarClass} rotate-3`}>
                  <Activity className="w-5 h-5 text-white" />
                </div>
                MedCore AI
              </h1>
              <p className="text-sm text-slate-400 mt-2 font-medium">
                {user.role === 'patient' ? 'Панель Пациента' : `Врач (${user.specialization})`}
              </p>
            </div>

            <nav className="space-y-2.5 flex-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setShowProfile(false); }}
                  className={`w-full flex items-center p-3.5 rounded-2xl transition-all duration-300 font-medium group ${
                    activeTab === tab.id 
                      ? activeTabClass
                      : `${isDarkMode ? 'text-slate-400 hover:bg-white/10 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'} border border-transparent hover:scale-[1.02] active:scale-[0.98]`
                  }`}
                >
                  <span className={`mr-3 transition-transform duration-300 ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110 opacity-70 group-hover:opacity-100'}`}>
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between mb-5">
                <button onClick={() => setShowProfile(!showProfile)} className="flex items-center bg-white/5 p-2 rounded-2xl border border-white/5 flex-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold mr-3 ${avatarClass}`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="overflow-hidden text-left">
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} truncate`}>{user.name}</p>
                    <p className="text-xs text-slate-400 capitalize">{user.role}</p>
                  </div>
                </button>
                <button onClick={() => setIsDarkMode(!isDarkMode)} className={`ml-2 p-3 rounded-2xl ${isDarkMode ? 'bg-white/10 text-amber-400' : 'bg-slate-200 text-indigo-600'}`}>
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center p-3 rounded-2xl text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-300 text-sm font-bold hover:scale-[1.02] active:scale-[0.98]"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Выйти
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 pb-8">
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 h-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

