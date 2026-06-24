import React, { useEffect } from 'react';
import { CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface ToastProps {
  show: boolean;
  message: string;
  type: 'success' | 'warning' | 'info';
  onClose: () => void;
}

export default function Toast({ show, message, type, onClose }: ToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const styles = {
    success: 'bg-teal-500/90 border-teal-400/50',
    warning: 'bg-rose-500/90 border-rose-400/50',
    info: 'bg-indigo-500/90 border-indigo-400/50',
  };

  const icons = {
    success: <CheckCircle className="w-6 h-6 mr-3" />,
    warning: <AlertTriangle className="w-6 h-6 mr-3" />,
    info: <Info className="w-6 h-6 mr-3" />,
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-4 duration-500">
      <div className={`${styles[type]} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center border font-bold backdrop-blur-xl`}>
        {icons[type]}
        {message}
      </div>
    </div>
  );
}
