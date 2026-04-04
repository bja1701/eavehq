import React from 'react';
import { Profile } from '../hooks/useProfile';

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
  created_at: string;
}

interface Job {
  id: string;
  name: string;
  address: string | null;
}

interface Props {
  quote: Quote;
  job: Job;
  profile: Profile | null;
  onDelete: () => void;
  onEdit: () => void;
}

export default function QuoteCard({ quote, job, profile, onDelete, onEdit }: Props) {
  const handlePrint = () => {
    const lineItemsHtml = (quote.line_items ?? []).map((item: any) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${item.type ?? 'Segment'}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.pitch ?? '—'}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${(item.length3d ?? 0).toFixed(1)} ft</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">$${((item.length3d ?? 0) * (quote.price_per_foot ?? 4)).toFixed(2)}</td>
      </tr>
    `).join('');

    const accentColor = profile?.brand_color ?? '#f59e0b';
    const companyName = profile?.company_name ?? 'Roof Estimator';
    const userName = profile?.full_name ?? '';
    const phone = profile?.phone ?? '';
    const email = profile?.email ?? '';
    const logoUrl = profile?.logo_url ?? '';
    const controllerLine = quote.include_controller && (quote.controller_fee ?? 0) > 0
      ? `<tr><td colspan="3" style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">Controller</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">$${(quote.controller_fee ?? 0).toFixed(2)}</td></tr>`
      : '';

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${job.name} — ${quote.label}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111; padding: 40px; max-width: 700px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
          .logo { max-height: 56px; max-width: 160px; object-fit: contain; }
          .company { text-align: right; }
          .company h2 { font-size: 18px; font-weight: 700; color: #111; }
          .company p { font-size: 12px; color: #6b7280; margin-top: 2px; }
          .divider { height: 3px; background: ${accentColor}; margin: 24px 0; border-radius: 2px; }
          .meta { display: flex; justify-content: space-between; margin-bottom: 24px; }
          .meta-block h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #9ca3af; font-weight: 600; margin-bottom: 4px; }
          .meta-block p { font-size: 14px; color: #111; font-weight: 500; }
          .meta-block p.sub { font-size: 12px; color: #6b7280; font-weight: 400; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 12px; }
          thead th { padding: 8px 12px; text-align: left; background: #f9fafb; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: #6b7280; font-weight: 600; }
          thead th:last-child, thead th:nth-child(3), thead th:nth-child(4) { text-align: right; }
          .total-row td { padding: 10px 12px; font-weight: 700; font-size: 14px; border-top: 2px solid #111; }
          .total-row td:last-child { text-align: right; color: ${accentColor}; }
          .notes { margin-top: 20px; padding: 12px 16px; background: #f9fafb; border-radius: 8px; font-size: 12px; color: #6b7280; }
          .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 11px; color: #9ca3af; }
          .accent-bar { height: 4px; background: ${accentColor}; border-radius: 2px; margin-top: 32px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            ${logoUrl ? `<img class="logo" src="${logoUrl}" alt="Logo" />` : `<div style="width:48px;height:48px;background:${accentColor};border-radius:8px;"></div>`}
          </div>
          <div class="company">
            <h2>${companyName}</h2>
            ${userName ? `<p>${userName}</p>` : ''}
            ${phone ? `<p>${phone}</p>` : ''}
            ${email ? `<p>${email}</p>` : ''}
            <p>Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
        <div class="divider"></div>
        <div class="meta">
          <div class="meta-block">
            <h3>Job</h3>
            <p>${job.name}</p>
            ${job.address ? `<p class="sub">${job.address}</p>` : ''}
          </div>
          <div class="meta-block" style="text-align:right;">
            <h3>Estimate</h3>
            <p>${quote.label}</p>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Section</th>
              <th style="text-align:center;">Pitch</th>
              <th style="text-align:right;">Linear Ft</th>
              <th style="text-align:right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${lineItemsHtml}
            ${controllerLine}
            <tr class="total-row">
              <td colspan="2">TOTAL</td>
              <td style="text-align:right;">${(quote.total_linear_ft ?? 0).toFixed(1)} ft</td>
              <td>$${(quote.total_price ?? 0).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        ${quote.notes ? `<div class="notes"><strong>Notes:</strong> ${quote.notes}</div>` : ''}
        <div class="accent-bar"></div>
        <div class="footer">Thank you for your business.</div>
        <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); }</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-white">{quote.label}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {new Date(quote.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Edit in estimator"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
            </svg>
          </button>
          <button
            onClick={handlePrint}
            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-950/30 rounded-lg transition-colors"
            title="Download PDF"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
            title="Delete estimate"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>

      {/* Line items preview */}
      {quote.line_items?.length > 0 && (
        <div className="space-y-1.5 mb-4">
          {quote.line_items.slice(0, 3).map((item: any, i: number) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-slate-400 capitalize">{item.type ?? 'Segment'} {item.pitch ? `· ${item.pitch}` : ''}</span>
              <span className="text-slate-300">{(item.length3d ?? 0).toFixed(1)} ft</span>
            </div>
          ))}
          {quote.line_items.length > 3 && (
            <p className="text-xs text-slate-600">+{quote.line_items.length - 3} more segments</p>
          )}
        </div>
      )}

      {/* Totals */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-500">{(quote.total_linear_ft ?? 0).toFixed(1)} linear ft</span>
        <span className="text-base font-bold text-amber-400">${(quote.total_price ?? 0).toFixed(2)}</span>
      </div>
    </div>
  );
}
