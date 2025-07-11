// This file was created by the assistant.
// It contains the Supabase Edge Function for sending push notifications.

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
    const { record: event } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Fetch sender and receiver profiles
    const { data: sender } = await supabaseAdmin.from('users').select('display_name').eq('id', event.sender_id).single();
    const { data: receiver } = await supabaseAdmin.from('users').select('expo_push_token').eq('id', event.receiver_id).single();

    if (!receiver?.expo_push_token) {
      console.error(`Receiver ${event.receiver_id} does not have a push token.`);
      return new Response('ok: No token for receiver');
    }

    let title = 'New message!';
    let body = `${sender.display_name} sent you a message.`;

    if (event.event_type === 'APPRECIATION') {
      title = event.content.title || 'New Appreciation';
      if (event.content.points && event.content.points_icon) {
        title += ` (+${event.content.points} ${event.content.points_icon})`;
      }
      
      if (event.content.description) {
        body = `${event.content.description}. ${sender.display_name} is thinking of you.`;
      } else {
        body = `${sender.display_name} is thinking of you.`;
      }
      
    } else if (event.event_type === 'FAVOR_REQUEST') {
      title = `${event.content.title}`;
      if (event.content.points) {
        title += ` (${event.content.points} pts)`;
      }
      
      body = `${sender.display_name} has requested a favor.`;
      if (event.content.description) {
        body = `${event.content.description}. ${body}`;
      }

    } else if (event.event_type === 'PING_SENT') {
       title = `${event.content.title}`;
       body = event.content.description || 'Trying to reach you.';
    
    } else if (event.event_type === 'DONT_PANIC') {
      title = event.content.title;
      body = `${event.content.description}`;
    
    } else if (event.event_type === 'WISDOM') {
      title = event.content.title;
      body = `${event.content.description}, ${sender.display_name} is thinking of you.`;
    }

    const message = {
      to: receiver.expo_push_token,
      sound: 'default',
      title,
      body,
      data: { eventId: event.id },
    };
    
    console.log('Constructed notification message:', JSON.stringify(message, null, 2));

    try {
      const res = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
        },
        body: JSON.stringify([message]),
      });
      
      const ticket = await res.json();
      console.log('Received push ticket from Expo:', JSON.stringify(ticket, null, 2));
    } catch (error) {
      console.error('Error sending push notification via fetch:', error);
    }

    return new Response('ok');

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
}); 