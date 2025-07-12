// supabase/functions/complete-favor/index.ts
//
// This function handles the logic when a user marks a favor as complete.
// 1. It updates the original favor event's status to 'COMPLETED'.
// 2. It adjusts the points for both the sender and receiver.
// 3. It invokes the 'send-notification' function to inform the partner.

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

    // 1. Fetch the original favor event
    const { data: event, error: fetchError } = await supabaseAdmin
      .from('events')
      .select('id, sender_id, receiver_id, content')
      .eq('id', event_id)
      .single();

    if (fetchError) throw fetchError;
    if (event.sender_id !== user_id) {
      return new Response(JSON.stringify({ error: 'Only the user who requested the favor can mark it complete.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    // 2. Update the event status to COMPLETED
    const { error: updateError } = await supabaseAdmin
      .from('events')
      .update({ status: 'COMPLETED', event_type: 'FAVOR_COMPLETED' })
      .eq('id', event_id);

    if (updateError) throw updateError;
    
    // 3. Adjust user points via RPC call
    const pointsToTransfer = event.content.points || 0;
    const { error: rpcError } = await supabaseAdmin.rpc('transfer_favor_points', {
      sender_id_in: event.sender_id,
      receiver_id_in: event.receiver_id,
      amount_in: pointsToTransfer
    });

    if (rpcError) {
      console.error('Error transferring points:', rpcError);
      return new Response(JSON.stringify({ error: `Error transferring points: ${rpcError.message}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // 4. Send notification to the partner who completed the favor
    const updatedEventPayload = {
      ...event,
      event_type: 'FAVOR_COMPLETED',
      status: 'COMPLETED',
    };

    const { error: invokeError } = await supabaseAdmin.functions.invoke('send-notification', {
      body: { record: updatedEventPayload },
    });

    if (invokeError) {
      console.error('Error invoking send-notification:', invokeError);
      return new Response(JSON.stringify({ error: `Favor was marked complete, but failed to send notification: ${invokeError.message}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

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