import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../hooks/useProfile';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [brandColor, setBrandColor] = useState('#f59e0b');
  const [pricePerFoot, setPricePerFoot] = useState(4.0);
  const [controllerFee, setControllerFee] = useState(300.0);
  const [includeController, setIncludeController] = useState(true);
  const [logoUrl, setLogoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? '');
      setCompanyName(profile.company_name ?? '');
      setPhone(profile.phone ?? '');
      setBrandColor(profile.brand_color ?? '#f59e0b');
      setPricePerFoot(profile.price_per_foot ?? 4.0);
      setControllerFee(profile.controller_fee ?? 300.0);
      setIncludeController(profile.include_controller ?? true);
      setLogoUrl(profile.logo_url ?? '');
    }
  }, [profile]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    setError('');

    const ext = file.name.split('.').pop();
    const path = `${user.id}/logo.${ext}`;
    const { error: uploadErr } = await supabase.storage.from('logos').upload(path, file, { upsert: true });
    if (uploadErr) { setError(uploadErr.message); setUploading(false); return; }

    const { data: urlData } = supabase.storage.from('logos').getPublicUrl(path);
    setLogoUrl(urlData.publicUrl);
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    const { error: err } = await updateProfile({
      full_name: fullName || null,
      company_name: companyName || null,
      phone: phone || null,
      brand_color: brandColor,
      price_per_foot: pricePerFoot,
      controller_fee: controllerFee,
      include_controller: includeController,
      logo_url: logoUrl || null,
    } as any);
    setSaving(false);
    if (err) { setError(err); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
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
        <span className="text-white font-semibold">Settings</span>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-white mb-8">Account Settings</h1>

        <div className="space-y-8">
          {/* Company Branding */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-base font-semibold text-white mb-5">Company Branding</h2>
            <div className="space-y-4">
              {/* Logo */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">Logo</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center overflow-hidden">
                    {logoUrl
                      ? <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                      : <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                    }
                  </div>
                  <div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="px-3 py-1.5 text-sm border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 rounded-lg transition-colors"
                    >
                      {uploading ? 'Uploading…' : 'Upload Logo'}
                    </button>
                    <p className="text-xs text-slate-600 mt-1">PNG or JPG, max 2MB. Shown on PDF exports.</p>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Company Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    placeholder="Your Company"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Your Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Brighton Jones"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="(801) 555-0100"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Brand Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={brandColor}
                      onChange={e => setBrandColor(e.target.value)}
                      className="w-10 h-10 rounded-lg border border-slate-700 bg-slate-800 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={brandColor}
                      onChange={e => setBrandColor(e.target.value)}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-base font-semibold text-white mb-1">Pricing Defaults</h2>
            <p className="text-xs text-slate-500 mb-5">Applied to all new estimates. You can override per-estimate in the toolbar.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Price per Linear Foot</label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-sm">$</span>
                  <input
                    type="number"
                    min={0}
                    step={0.25}
                    value={pricePerFoot}
                    onChange={e => setPricePerFoot(parseFloat(e.target.value) || 0)}
                    className="w-32 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  <span className="text-slate-500 text-xs">/ ft</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Controller Fee</label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-sm">$</span>
                  <input
                    type="number"
                    min={0}
                    step={10}
                    value={controllerFee}
                    onChange={e => setControllerFee(parseFloat(e.target.value) || 0)}
                    className="w-32 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIncludeController(!includeController)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${includeController ? 'bg-amber-500' : 'bg-slate-700'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${includeController ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                </button>
                <span className="text-sm text-slate-300">Include controller by default</span>
              </div>
            </div>
          </section>

          {error && (
            <p className="text-sm text-red-400 bg-red-950/50 border border-red-900/50 rounded-lg px-4 py-3">{error}</p>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 font-semibold text-sm rounded-lg transition-colors"
            >
              {saving ? 'Saving…' : 'Save Settings'}
            </button>
            {saved && <span className="text-sm text-green-400">Saved!</span>}
          </div>
        </div>
      </main>
    </div>
  );
}
