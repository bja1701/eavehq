import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { supabase } from '../lib/supabase';

interface Props {
  onSuccess: () => void;
  onNewUser: () => void;
}

export default function AuthPage({ onSuccess, onNewUser }: Props) {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { signIn, signUp } = useAuth();
  const { fetchProfile } = useProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (tab === 'login') {
      const { error: err } = await signIn(email, password);
      if (err) {
        setError(err);
        setSubmitting(false);
        return;
      }
      const { data } = await supabase.auth.getUser();
      if (data?.user) await fetchProfile(data.user.id);
      onSuccess();
    } else {
      const { error: err } = await signUp(email, password);
      if (err) {
        setError(err);
        setSubmitting(false);
        return;
      }
      // After signup, session is set automatically via onAuthStateChange
      // Small delay for trigger to fire and create profile
      await new Promise(r => setTimeout(r, 800));
      const { data } = await supabase.auth.getUser();
      if (data?.user) await fetchProfile(data.user.id);
      onNewUser();
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg shadow-lg shadow-amber-500/30"></div>
          <span className="text-xl font-bold text-white tracking-tight">Roof Estimator</span>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          {/* Tabs */}
          <div className="flex bg-slate-800 rounded-lg p-1 mb-6">
            <button
              onClick={() => { setTab('login'); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                tab === 'login'
                  ? 'bg-slate-700 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setTab('signup'); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                tab === 'signup'
                  ? 'bg-slate-700 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-colors"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-950/50 border border-red-900/50 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 font-semibold text-sm rounded-lg transition-colors"
            >
              {submitting
                ? (tab === 'login' ? 'Signing in…' : 'Creating account…')
                : (tab === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          {tab === 'signup' && (
            <p className="mt-4 text-center text-xs text-slate-500">
              Start with 5 free estimates. No credit card required.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
