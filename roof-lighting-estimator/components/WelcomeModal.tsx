import React from 'react';
import { useProfile } from '../hooks/useProfile';

interface Props {
  onClose: () => void;
}

export default function WelcomeModal({ onClose }: Props) {
  const { markWelcomeShown } = useProfile();

  const handleClose = async () => {
    await markWelcomeShown();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center">
        <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl mx-auto mb-5 flex items-center justify-center shadow-lg shadow-amber-500/30">
          <span className="text-2xl">🎉</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Welcome aboard!</h2>
        <p className="text-slate-400 text-sm mb-1">
          You've got <span className="text-amber-400 font-semibold">5 free estimates</span> to start.
        </p>
        <p className="text-slate-500 text-xs mb-6">
          Trace rooflines, save quotes, and download branded PDFs. No credit card needed.
        </p>
        <button
          onClick={handleClose}
          className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm rounded-lg transition-colors"
        >
          Let's go
        </button>
      </div>
    </div>
  );
}
