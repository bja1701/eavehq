import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
  onClose: () => void;
}

export default function ProWelcomeModal({ onClose }: Props) {
  const navigate = useNavigate();

  const handleClose = () => {
    // Strip the ?upgrade=success param so it doesn't re-show on refresh
    navigate('/settings', { replace: true });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 backdrop-blur-sm px-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/8 shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
        style={{ background: '#1e2d45' }}>

        {/* Amber top bar */}
        <div style={{ height: 5, background: 'linear-gradient(90deg,#f59e0b,#fbbf24)' }} />

        <div className="p-8 text-center">
          {/* Icon */}
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ background: 'linear-gradient(135deg,#f59e0b,#fbbf24)', boxShadow: '0 8px 24px rgba(245,158,11,0.4)' }}>
            <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              workspace_premium
            </span>
          </div>

          {/* Headline */}
          <h2 className="font-headline text-2xl font-extrabold text-white mb-2">
            You're on Pro!
          </h2>
          <p className="text-slate-400 text-sm mb-7">
            Unlimited estimates unlocked. No more limits — build every job exactly how you want it.
          </p>

          {/* Feature list */}
          <div className="rounded-xl p-4 mb-7 text-left space-y-3"
            style={{ background: '#0f1729', border: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              'Unlimited roofline estimates',
              'PDF client quotes',
              'Job pipeline & payment tracking',
              'Cancel anytime from Settings',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
                  style={{ background: 'rgba(245,158,11,0.15)' }}>
                  <span className="material-symbols-outlined text-amber-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check
                  </span>
                </div>
                <span className="text-sm text-slate-300">{item}</span>
              </div>
            ))}
          </div>

          <button
            onClick={handleClose}
            className="w-full rounded-xl py-3.5 text-sm font-bold transition-opacity hover:opacity-90"
            style={{ background: '#f59e0b', color: '#0f1729' }}
          >
            Let's build →
          </button>
        </div>
      </div>
    </div>
  );
}
