import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const inputCls = 'w-full pl-10 pr-4 py-3 bg-surface-container-low border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-container text-on-surface text-sm placeholder:text-outline/50 transition-all';
  const labelCls = 'block text-[11px] font-label font-bold uppercase tracking-wider text-on-surface-variant mb-1.5';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setSubmitting(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (err) { setError(err.message); return; }
    setDone(true);
    setTimeout(() => navigate('/'), 2000);
  };

  return (
    <div className="fixed inset-0 bg-inverse-surface flex items-center justify-center z-50 px-4 overflow-hidden">
      <div className="relative z-10 w-full max-w-lg">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 amber-gradient rounded-xl shadow-xl flex items-center justify-center mb-4 border border-white/10">
            <svg className="w-9 h-9 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M12 2L1 9l2 1.5V20h18V10.5L23 9 12 2zm0 2.5L20 10v8H4v-8l8-5.5z" />
              <rect x="9" y="14" width="6" height="6" rx="0.5" />
            </svg>
          </div>
          <h1 className="font-headline font-extrabold text-3xl tracking-tight text-white mb-2">New password</h1>
          <p className="text-surface-variant font-label uppercase tracking-[0.2em] text-[10px]">Choose something secure</p>
        </div>

        <div className="bg-surface-container-lowest rounded-xl shadow-2xl overflow-hidden border border-white/5">
          <div className="px-8 py-8">
            {done ? (
              <div className="text-center py-4">
                <p className="text-on-surface font-semibold mb-2">Password updated!</p>
                <p className="text-on-surface-variant text-sm">Redirecting you to the app…</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className={labelCls} htmlFor="new-password">New Password</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    <input id="new-password" type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls} htmlFor="confirm-password">Confirm Password</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    <input id="confirm-password" type="password" required minLength={6} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" className={inputCls} />
                  </div>
                </div>
                {error && (
                  <div className="bg-error-container/30 border-l-4 border-error p-3 rounded-r-lg">
                    <p className="text-sm text-error font-medium">{error}</p>
                  </div>
                )}
                <button type="submit" disabled={submitting} className="w-full amber-gradient text-white font-headline font-bold py-4 rounded-lg shadow-lg disabled:opacity-60">
                  {submitting ? 'Saving…' : 'Set new password'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
