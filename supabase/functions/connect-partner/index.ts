// This file was created by the assistant.
// It contains the Supabase Edge Function for connecting partners.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { inviteCode } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user } } = await supabaseAdmin.auth.getUser(
      req.headers.get('Authorization').replace('Bearer ', '')
    );

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // Find the partner with the given invite code
    const { data: partner, error: partnerError } = await supabaseAdmin
      .from('users')
      .select('id, display_name')
      .eq('invite_code', inviteCode)
      .single();

    if (partnerError || !partner) {
      return new Response(JSON.stringify({ error: 'Invalid invite code' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    // Link the two users
    await supabaseAdmin
      .from('users')
      .update({ partner_id: partner.id })
      .eq('id', user.id);
      
    await supabaseAdmin
      .from('users')
      .update({ partner_id: user.id })
      .eq('id', partner.id);

    return new Response(JSON.stringify({ partnerName: partner.display_name }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
}); 