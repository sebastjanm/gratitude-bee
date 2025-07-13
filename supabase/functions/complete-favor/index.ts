// supabase/functions/complete-favor/index.ts
//
// This function handles the logic when a user marks a favor as complete.
// It performs one critical action: updating the original favor event's status to 'COMPLETED'.
// The `handle_event_points` trigger will then automatically award the points,
// and a separate trigger on the events table will handle sending the notification.
// This keeps the logic clean, centralized, and aligned with the event-sourcing pattern.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { event_id, user_id } = await req.json();
    if (!event_id || !user_id) {
      return new Response(JSON.stringify({ error: 'Missing event_id or user_id' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Fetch the original favor event to verify ownership
    const { data: event, error: fetchError } = await supabaseAdmin
      .from('events')
      .select('id, sender_id, receiver_id')
      .eq('id', event_id)
      .single();

    if (fetchError) throw fetchError;
    if (event.sender_id !== user_id) {
      return new Response(JSON.stringify({ error: 'Only the user who requested the favor can mark it complete.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    // 2. Update the event status to COMPLETED.
    // The handle_event_points trigger will automatically handle the point transfer.
    // Another trigger will handle the notification.
    const { error: updateError } = await supabaseAdmin
      .from('events')
      .update({ status: 'COMPLETED', event_type: 'FAVOR_COMPLETED' })
      .eq('id', event_id);

    if (updateError) throw updateError;
    
    return new Response(JSON.stringify({ message: 'Favor completed successfully!' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error completing favor:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}); 