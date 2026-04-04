import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import NewJobModal from '../components/NewJobModal';

interface Job {
  id: string;
  name: string;
  address: string | null;
  notes: string | null;
  created_at: string;
  quote_count?: number;
}

export default function JobsPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewJob, setShowNewJob] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('jobs')
      .select('*, quotes(count)')
      .order('created_at', { ascending: false });

    if (data) {
      const mapped = data.map((j: any) => ({
        ...j,
        quote_count: j.quotes?.[0]?.count ?? 0,
      }));
      setJobs(mapped);
    }
    setLoading(false);
  };

  const filtered = jobs.filter(j =>
    j.name.toLowerCase().includes(search.toLowerCase()) ||
    (j.address ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg shadow-md shadow-amber-500/20"></div>
          <span className="font-bold text-white tracking-tight">Roof Estimator</span>
        </div>
        <nav className="flex items-center gap-1">
          <button
            onClick={() => navigate('/estimator')}
            className="px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            Estimator
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            Settings
          </button>
          {profile?.role === 'admin' && (
            <button
              onClick={() => navigate('/admin')}
              className="px-3 py-1.5 text-sm text-amber-400 hover:text-amber-300 hover:bg-amber-950/30 rounded-lg transition-colors"
            >
              Admin
            </button>
          )}
          <button
            onClick={signOut}
            className="ml-2 px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Jobs</h1>
            <p className="text-slate-400 text-sm mt-0.5">Manage your client projects and estimates</p>
          </div>
          <button
            onClick={() => setShowNewJob(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm rounded-lg transition-colors shadow-lg shadow-amber-500/20"
          >
            <span className="text-base leading-none">+</span>
            New Job
          </button>
        </div>

        {/* Usage bar for free tier */}
        {profile?.subscription_tier === 'free' && (
          <div className="mb-6 bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-sm text-slate-300">
                <span className="font-semibold text-white">{profile.estimates_used}</span>
                <span className="text-slate-400"> / 5 free estimates used</span>
              </div>
              <div className="w-32 h-1.5 bg-slate-700 rounded-full">
                <div
                  className="h-1.5 bg-amber-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (profile.estimates_used / 5) * 100)}%` }}
                />
              </div>
            </div>
            {profile.estimates_used >= 5 && (
              <span className="text-xs text-amber-400 font-medium bg-amber-950/50 px-2.5 py-1 rounded-full border border-amber-800/50">
                Limit reached — contact us to upgrade
              </span>
            )}
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search jobs or addresses…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-colors"
          />
        </div>

        {/* Jobs Grid */}
        {loading ? (
          <div className="text-center py-16 text-slate-500">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 border border-slate-800 rounded-2xl bg-slate-900/50">
            <div className="w-12 h-12 bg-slate-800 rounded-xl mx-auto mb-4 flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <p className="text-slate-400 font-medium mb-1">No jobs yet</p>
            <p className="text-slate-600 text-sm mb-5">Create your first job to start estimating</p>
            <button
              onClick={() => setShowNewJob(true)}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm rounded-lg transition-colors"
            >
              Create First Job
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(job => (
              <div
                key={job.id}
                onClick={() => navigate(`/jobs/${job.id}`)}
                className="bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-xl p-5 cursor-pointer transition-all hover:shadow-lg hover:shadow-black/30 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-800/30 rounded-lg flex items-center justify-center">
                    <svg className="w-4.5 h-4.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(job.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-semibold text-white mb-0.5 group-hover:text-amber-100 transition-colors">{job.name}</h3>
                {job.address && <p className="text-xs text-slate-400 truncate mb-3">{job.address}</p>}
                <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-800">
                  <span className="text-xs text-slate-500">
                    {job.quote_count} {job.quote_count === 1 ? 'estimate' : 'estimates'}
                  </span>
                  <span className="text-xs text-amber-500 group-hover:text-amber-400 transition-colors">View →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showNewJob && (
        <NewJobModal
          onCreated={(jobId) => {
            setShowNewJob(false);
            fetchJobs();
            navigate(`/jobs/${jobId}`);
          }}
          onClose={() => setShowNewJob(false)}
        />
      )}
    </div>
  );
}
