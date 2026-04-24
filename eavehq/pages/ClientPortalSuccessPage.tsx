import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface ContractorProfile {
  company_name: string | null;
  logo_url: string | null;
}

export default function ClientPortalSuccessPage() {
  const { token } = useParams<{ token: string }>();

  const [contractor, setContractor] = useState<ContractorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetchContractor(token);
  }, [token]);

  const fetchContractor = async (portalToken: string) => {
    const { data: jobData } = await supabase
      .from('jobs')
      .select('user_id')
      .eq('portal_token', portalToken)
      .single();

    if (jobData?.user_id) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('company_name, logo_url')
        .eq('id', jobData.user_id)
        .single();
      setContractor((profileData as ContractorProfile) ?? null);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center space-y-5">
        {/* Checkmark */}
        <div className="w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center">
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {contractor?.logo_url && (
          <img
            src={contractor.logo_url}
            alt="Company logo"
            className="h-12 w-auto object-contain mx-auto"
          />
        )}

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment received!</h1>
          <p className="text-gray-500 mt-2 text-sm leading-relaxed">
            {contractor?.company_name
              ? <><span className="font-semibold text-gray-700">{contractor.company_name}</span> will be in touch shortly to schedule your installation.</>
              : 'Your contractor will be in touch shortly to schedule your installation.'
            }
          </p>
        </div>

        <p className="text-xs text-gray-400">
          You'll receive a confirmation email from Stripe. Keep it for your records.
        </p>
      </div>
    </div>
  );
}
