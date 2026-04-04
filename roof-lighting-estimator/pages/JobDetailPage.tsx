import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useProfile } from '../hooks/useProfile';
import QuoteCard from '../components/QuoteCard';

interface Job {
  id: string;
  name: string;
  address: string | null;
  notes: string | null;
}

interface Quote {
  id: string;
  label: string;
  line_items: any[];
  notes: string | null;
  total_linear_ft: number | null;
  total_price: number | null;
  price_per_foot: number | null;
  controller_fee: number | null;
  include_controller: boolean | null;
  canvas_state: any | null;
  created_at: string;
}

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [job, setJob] = useState<Job | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchJobAndQuotes(id);
  }, [id]);

  const fetchJobAndQuotes = async (jobId: string) => {
    setLoading(true);
    const [{ data: jobData }, { data: quotesData }] = await Promise.all([
      supabase.from('jobs').select('*').eq('id', jobId).single(),
      supabase.from('quotes').select('*').eq('job_id', jobId).order('created_at', { ascending: false }),
    ]);
    setJob(jobData ?? null);
    setQuotes(quotesData ?? []);
    setLoading(false);
  };

  const handleDeleteQuote = async (quoteId: string) => {
    if (!confirm('Delete this estimate?')) return;
    await supabase.from('quotes').delete().eq('id', quoteId);
    setQuotes(q => q.filter(x => x.id !== quoteId));
  };

  const handleOpenEstimator = (quote?: Quote) => {
    if (quote?.canvas_state) {
      sessionStorage.setItem('restore_quote', JSON.stringify({ quoteId: quote.id, jobId: id, canvasState: quote.canvas_state, label: quote.label }));
    } else {
      sessionStorage.setItem('restore_quote', JSON.stringify({ jobId: id }));
    }
    navigate('/estimator');
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">Loading…</div>;
  if (!job) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">Job not found.</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center gap-4">
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
        <span className="text-white font-semibold">{job.name}</span>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Job Info */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{job.name}</h1>
            {job.address && <p className="text-slate-400 text-sm mt-1">{job.address}</p>}
            {job.notes && <p className="text-slate-500 text-sm mt-1 italic">{job.notes}</p>}
          </div>
          <button
            onClick={() => handleOpenEstimator()}
            disabled={profile?.subscription_tier === 'free' && (profile?.estimates_used ?? 0) >= 5}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 font-semibold text-sm rounded-lg transition-colors shadow-lg shadow-amber-500/20"
          >
            <span className="text-base leading-none">+</span>
            New Estimate
          </button>
        </div>

        {/* Quotes */}
        {quotes.length === 0 ? (
          <div className="text-center py-16 border border-slate-800 rounded-2xl bg-slate-900/50">
            <p className="text-slate-400 font-medium mb-1">No estimates yet</p>
            <p className="text-slate-600 text-sm mb-5">Open the estimator to trace rooflines and save an estimate</p>
            <button
              onClick={() => handleOpenEstimator()}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm rounded-lg transition-colors"
            >
              Open Estimator
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quotes.map(quote => (
              <QuoteCard
                key={quote.id}
                quote={quote}
                job={job}
                profile={profile}
                onDelete={() => handleDeleteQuote(quote.id)}
                onEdit={() => handleOpenEstimator(quote)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
