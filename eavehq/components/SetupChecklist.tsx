import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Profile } from '../hooks/useProfile';

interface Props {
  profile: Profile | null;
}

const STORAGE_KEY = 'setup_checklist_dismissed';

export default function SetupChecklist({ profile }: Props) {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(STORAGE_KEY) === '1');

  if (dismissed) return null;

  const status = profile?.subscription_status;
  if (status !== 'active' && status !== 'canceling') return null;

  const steps = [
    { label: 'Create your account', done: true },
    {
      label: 'Connect Stripe',
      done: profile?.stripe_connect_enabled === true,
      action: () => navigate('/settings'),
      actionLabel: 'Go to Settings',
    },
    {
      label: 'Add company branding',
      done: Boolean(profile?.company_name),
      action: () => navigate('/settings'),
      actionLabel: 'Go to Settings',
    },
  ];

  const allDone = steps.every(s => s.done);
  if (allDone) return null;

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setDismissed(true);
  };

  return (
    <div className="mb-6 rounded-xl border border-outline-variant/20 bg-surface-container-lowest shadow-sm p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="font-headline font-bold text-on-surface text-base">Finish setting up EaveHQ</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">Complete these steps to start accepting client payments.</p>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss setup checklist"
          className="shrink-0 text-on-surface-variant hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
      </div>

      <ol className="space-y-2">
        {steps.map((step, i) => (
          <li key={i} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span
                className={`material-symbols-outlined text-base ${step.done ? 'text-green-600' : 'text-on-surface-variant'}`}
                style={step.done ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {step.done ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              <span className={`text-sm ${step.done ? 'line-through text-on-surface-variant' : 'text-on-surface font-medium'}`}>
                {step.label}
              </span>
            </div>
            {!step.done && step.action && (
              <button
                type="button"
                onClick={step.action}
                className="text-xs font-semibold text-primary hover:underline shrink-0"
              >
                {step.actionLabel}
              </button>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
