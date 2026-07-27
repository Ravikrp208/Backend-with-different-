import React from 'react';
import { CheckCircle2, AlertCircle, Info, ExternalLink, X } from 'lucide-react';

const Toast = ({ toast, onClose }) => {
  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400" />,
    info: <Info className="w-5 h-5 text-sky-400" />
  };

  const borderColors = {
    success: 'border-emerald-500/30 bg-emerald-950/50',
    error: 'border-rose-500/30 bg-rose-950/50',
    info: 'border-sky-500/30 bg-sky-950/50'
  };

  const textColors = {
    success: 'text-emerald-200',
    error: 'text-rose-200',
    info: 'text-sky-200'
  };

  const linkColors = {
    success: 'text-emerald-400 hover:text-emerald-300',
    error: 'text-rose-400 hover:text-rose-300',
    info: 'text-sky-400 hover:text-sky-300'
  };

  return (
    <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-300 transform translate-y-0 max-w-md ${borderColors[toast.type] || borderColors.info}`}>
      <div className="shrink-0">
        {icons[toast.type]}
      </div>
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <span className={`text-sm font-semibold ${textColors[toast.type] || textColors.info}`}>{toast.message}</span>
        {toast.txHash && (
          <a
            href={`https://sepolia.etherscan.io/tx/${toast.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-xs flex items-center gap-1 ${linkColors[toast.type] || linkColors.info}`}
          >
            View on Sepolia Etherscan <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
      <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
