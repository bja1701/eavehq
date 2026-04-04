import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import { useEstimatorStore } from '../store/useEstimatorStore';

interface Job {
  id: string;
  name: string;
  address: string | null;
}

interface Props {
  onSaved: () => void;
  onClose: () => void;
}

export default function SaveToJobModal({ onSaved, onClose }: Props) {
  const { user } = useAuth();
  const { profile, incrementEstimates } = useProfile();
  const { nodes, lines, totalLength2D, totalLength3D, estimatedCost, pricePerFt, controllerFee, includeController, satelliteCenter } = useEstimatorStore();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [newJobName, setNewJobName] = useState('');
  const [label, setLabel] = useState('Estimate');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'existing' | 'new'>('existing');

  // Check estimate limit
  const atLimit = profile?.subscription_tier === 'free' && (profile?.estimates_used ?? 0) >= 5;

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const { data } = await supabase.from('jobs').select('id, name, address').order('created_at', { ascending: false });
    setJobs(data ?? []);
    if (data && data.length > 0) {
      setSelectedJobId(data[0].id);
    } else {
      setMode('new');
    }
  };

  // Build line items from current canvas state
  const buildLineItems = () => {
    return lines.map(line => {
      const start = nodes.find(n => n.id === line.startNodeId);
      const end = nodes.find(n => n.id === line.endNodeId);
      return {
        id: line.id,
        type: line.type,
        pitch: line.pitch,
        startNode: start ?? null,
        endNode: end ?? null,
      };
    });
  };

  const handleSave = async () => {
    if (atLimit) return;
    if (mode === 'existing' && !selectedJobId) { setError('Select a job'); return; }
    if (mode === 'new' && !newJobName.trim()) { setError('Enter a job name'); return; }
    if (!user) return;

    setSubmitting(true);
    setError('');

    let jobId = selectedJobId;

    // Create new job if needed
    if (mode === 'new') {
      const { data, error: jobErr } = await supabase
        .from('jobs')
        .insert({ user_id: user.id, name: newJobName.trim() })
        .select()
        .single();
      if (jobErr) { setError(jobErr.message); setSubmitting(false); return; }
      jobId = data.id;
    }

    // Save quote
    const canvasState = { nodes, lines, pricePerFt, controllerFee, includeController, satelliteCenter };
    const { error: quoteErr } = await supabase.from('quotes').insert({
      job_id: jobId,
      label: label.trim() || 'Estimate',
      line_items: buildLineItems(),
      notes: notes.trim() || null,
      price_per_foot: pricePerFt,
      controller_fee: controllerFee,
      include_controller: includeController,
      total_linear_ft: totalLength3D,
      total_price: estimatedCost,
      canvas_state: canvasState,
    });

    if (quoteErr) { setError(quoteErr.message); setSubmitting(false); return; }

    await incrementEstimates();
    setSubmitting(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Save Estimate</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {atLimit ? (
          <div className="text-center py-6">
            <p className="text-amber-400 font-semibold mb-2">Free estimate limit reached</p>
            <p className="text-slate-400 text-sm mb-4">You've used all 5 free estimates. Contact us to upgrade your account.</p>
            <button onClick={onClose} className="px-4 py-2 bg-slate-700 text-white text-sm rounded-lg">Close</button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Total linear ft</p>
                <p className="text-lg font-bold text-white">{totalLength3D.toFixed(1)} ft</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Estimated cost</p>
                <p className="text-lg font-bold text-amber-400">${estimatedCost.toFixed(2)}</p>
              </div>
            </div>

            {/* Job selector */}
            {jobs.length > 0 && (
              <div className="flex bg-slate-800 rounded-lg p-1">
                <button
                  onClick={() => setMode('existing')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${mode === 'existing' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Existing Job
                </button>
                <button
                  onClick={() => setMode('new')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${mode === 'new' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  New Job
                </button>
              </div>
            )}

            {mode === 'existing' ? (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Job</label>
                <select
                  value={selectedJobId}
                  onChange={e => setSelectedJobId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                >
                  {jobs.map(j => (
                    <option key={j.id} value={j.id}>{j.name}{j.address ? ` — ${j.address}` : ''}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Job Name *</label>
                <input
                  type="text"
                  value={newJobName}
                  onChange={e => setNewJobName(e.target.value)}
                  placeholder="e.g. Johnson Residence"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Estimate Label</label>
              <input
                type="text"
                value={label}
                onChange={e => setLabel(e.target.value)}
                placeholder="Estimate"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Includes clip installation, excludes power run."
                rows={2}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-950/50 border border-red-900/50 rounded-lg px-3 py-2">{error}</p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 border border-slate-700 text-slate-300 hover:text-white text-sm font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={submitting}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 font-semibold text-sm rounded-lg transition-colors"
              >
                {submitting ? 'Saving…' : 'Save Estimate'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
