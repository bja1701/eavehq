import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
    apiVersion: '2024-04-10',
  });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      sig,
      Deno.env.get('STRIPE_WEBHOOK_SECRET_PORTAL')!,
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Webhook signature verification failed';
    return new Response(message, { status: 400 });
  }

  if (event.type !== 'checkout.session.completed') {
    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const portalToken = session.metadata?.portal_token;
  const jobId = session.metadata?.job_id;

  if (!portalToken || !jobId) {
    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const amountDollars = (session.amount_total ?? 0) / 100;
  const customerId = typeof session.customer === 'string' ? session.customer : null;
  const paymentType = session.metadata?.payment_type;

  let updatePayload: Record<string, unknown>;
  if (paymentType === 'final') {
    updatePayload = {
      status: 'final_paid',
      final_paid_at: new Date().toISOString(),
      final_amount: amountDollars,
    };
  } else {
    updatePayload = {
      status: 'deposit_paid',
      deposit_paid_at: new Date().toISOString(),
      deposit_amount: amountDollars,
      stripe_customer_id: customerId,
      stripe_deposit_link: session.url,
    };
  }

  const { error } = await supabase
    .from('jobs')
    .update(updatePayload)
    .eq('id', jobId);

  if (error) {
    console.error(`Failed to update job on portal ${paymentType ?? 'deposit'}:`, error);
    return new Response('DB update failed', { status: 500 });
  }

  console.log(`Portal ${paymentType ?? 'deposit'} recorded for job ${jobId}: $${amountDollars}`);
  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
