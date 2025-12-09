import React, { useEffect } from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';

export const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  
  // Auto-cierre: Desaparece sola después de 3 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-xl z-[100] text-white flex items-center gap-3 animate-in slide-in-from-right fade-in duration-300 ${type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
      {type === 'error' ? <AlertTriangle size={20}/> : <CheckCircle2 size={20}/>}
      <p className="font-medium text-sm">{message}</p>
      <button onClick={onClose} className="hover:bg-white/20 p-1 rounded transition-colors">
        <X size={14}/>
      </button>
    </div>
  );
};