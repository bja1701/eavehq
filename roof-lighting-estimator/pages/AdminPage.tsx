import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useProfile } from '../hooks/useProfile';

interface UserRow {
  id: string;
  full_name: string | null;
  company_name: string | null;
  email: string | null;
  subscription_tier: 'free' | 'retainer' | 'paid';
  estimates_used: number;
  role: 'user' | 'admin';
  created_at: string;
}

interface FeedbackRow {
  id: string;
  user_id: string | null;
  rating: number | null;
  message: string;
  page: string | null;
  created_at: string;
}

export default function AdminPage() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [feedback, setFeedback] = useState<FeedbackRow[]>([]);
  const [tab, setTab] = useState<'users' | 'feedback'>('users');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (profile && profile.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchData();
  }, [profile]);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: userData }, { data: fbData }] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('feedback').select('*').order('created_at', { ascending: false }),
    ]);
    setUsers(userData ?? []);
    setFeedback(fbData ?? []);
    setLoading(false);
  };

  const handleTierChange = async (userId: string, tier: UserRow['subscription_tier']) => {
    setSavingId(userId);
    await supabase.from('profiles').update({ subscription_tier: tier }).eq('id', userId);
    setUsers(u => u.map(x => x.id === userId ? { ...x, subscription_tier: tier } : x));
    setSavingId(null);
  };

  const tierBadge = (tier: string) => {
    const styles: Record<string, string> = {
      free: 'text-slate-400 bg-slate-800 border-slate-700',
      retainer: 'text-blue-300 bg-blue-950/50 border-blue-800/50',
      paid: 'text-green-300 bg-green-950/50 border-green-800/50',
    };
    return `text-xs px-2 py-0.5 rounded-full border font-medium ${styles[tier] ?? styles.free}`;
  };

  const stats = {
    total: users.length,
    free: users.filter(u => u.subscription_tier === 'free').length,
    retainer: users.filter(u => u.subscription_tier === 'retainer').length,
    paid: users.filter(u => u.subscription_tier === 'paid').length,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Jobs
          </button>
          <span className="text-slate-700">/</span>
          <span className="text-amber-400 font-semibold text-sm">Admin</span>
        </div>
        <span className="text-xs text-slate-500 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
          Admin Panel
        </span>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-white mb-8">Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: stats.total, color: 'text-white' },
            { label: 'Free Tier', value: stats.free, color: 'text-slate-400' },
            { label: 'Retainer', value: stats.retainer, color: 'text-blue-400' },
            { label: 'Paid', value: stats.paid, color: 'text-green-400' },
          ].map(s => (
            <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1 w-fit mb-6">
          {(['users', 'feedback'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-all ${tab === t ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-500">Loading…</div>
        ) : tab === 'users' ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">User</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Company</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tier</th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Estimates</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-white">{u.full_name ?? '—'}</p>
                      <p className="text-xs text-slate-500">{u.email ?? '—'}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">{u.company_name ?? '—'}</td>
                    <td className="px-5 py-3.5">
                      <select
                        value={u.subscription_tier}
                        onChange={e => handleTierChange(u.id, e.target.value as UserRow['subscription_tier'])}
                        disabled={savingId === u.id}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
                      >
                        <option value="free">Free</option>
                        <option value="retainer">Retainer</option>
                        <option value="paid">Paid</option>
                      </select>
                    </td>
                    <td className="px-5 py-3.5 text-center text-slate-300">{u.estimates_used}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <p className="text-center py-10 text-slate-500">No users yet.</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {feedback.length === 0 && (
              <p className="text-center py-10 text-slate-500">No feedback yet.</p>
            )}
            {feedback.map(f => (
              <div key={f.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-1">
                    {f.rating && [1,2,3,4,5].map(s => (
                      <svg key={s} className={`w-4 h-4 ${s <= f.rating! ? 'text-amber-400' : 'text-slate-700'}`} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-slate-500">{new Date(f.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-slate-200">{f.message}</p>
                {f.page && <p className="text-xs text-slate-600 mt-1">Page: {f.page}</p>}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
