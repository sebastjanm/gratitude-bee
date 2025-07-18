// supabase/functions/add-reaction/index.ts
// This function adds a reaction to an event and sends a notification to the original sender.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  try {
    // 1. Validate the request
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    const { event_id, reaction_type, user_id } = await req.json();

    if (!event_id || !reaction_type || !user_id) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Create a Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 3. Fetch the event and verify permissions
    const { data: event, error: fetchError } = await supabase
      .from('events')
      .select('id, receiver_id, sender_id, reaction, event_type, content')
      .eq('id', event_id)
      .single();

    if (fetchError || !event) {
      return new Response(JSON.stringify({ error: 'Event not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (event.receiver_id !== user_id) {
      return new Response(JSON.stringify({ error: 'You are not authorized to react to this event' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (event.reaction) {
      return new Response(JSON.stringify({ error: 'A reaction has already been added to this event' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 4. Update the event with the reaction
    const { error: updateError } = await supabase
      .from('events')
      .update({ reaction: reaction_type })
      .eq('id', event_id);

    if (updateError) {
      throw new Error(`Failed to add reaction: ${updateError.message}`);
    }

    // 5. Trigger a notification for the reaction
    const { data: senderProfile } = await supabase
      .from('users')
      .select('display_name')
      .eq('id', event.sender_id)
      .single();

    const { data: receiverProfile } = await supabase
      .from('users')
      .select('display_name')
      .eq('id', user_id)
      .single();

    if (senderProfile && receiverProfile) {
      const notificationPayload = {
        record: {
          sender_id: user_id, // The reactor is the sender of the notification
          receiver_id: event.sender_id, // The original event sender is the receiver
          event_type: 'REACTION',
          content: {
            reaction: reaction_type,
            original_event_type: event.event_type,
            original_event_title: event.content?.title || 'your message',
            sender_name: receiverProfile.display_name,
          },
        },
      };

      // Asynchronously invoke the send-notification function
      const { error: invokeError } = await supabase.functions.invoke('send-notification', {
        body: notificationPayload,
      });

      if (invokeError) {
        // If the notification fails, we should still consider the reaction successful,
        // but we need to log this error for debugging.
        console.error('Failed to send notification for reaction:', invokeError);
      }
    }

    // 6. Return a success response
    return new Response(JSON.stringify({ success: true, message: 'Reaction added successfully' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}); 