// This file was created by the assistant.
// It contains the Supabase Edge Function for sending push notifications.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Expo } from 'https://esm.sh/expo-server-sdk@3.7.0';

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
    
    const expo = new Expo();

    // Fetch sender and receiver profiles
    const { data: sender } = await supabaseAdmin.from('profiles').select('display_name').eq('id', event.sender_id).single();
    const { data: receiver } = await supabaseAdmin.from('profiles').select('expo_push_token').eq('id', event.receiver_id).single();

    if (!receiver?.expo_push_token) {
      console.log('Receiver does not have a push token.');
      return new Response('ok');
    }

    let title = 'New Appreciation!';
    let body = `${sender.display_name} sent you a badge.`;

    if (event.event_type === 'APPRECIATION') {
      title = `You received a ${event.content.title} badge!`;
      body = `${sender.display_name} is thinking of you.`;
    } else if (event.event_type === 'FAVOR_REQUEST') {
      title = 'New Favor Request';
      body = `${sender.display_name} has requested a favor: "${event.content.title}"`;
    } else if (event.event_type === 'PING_SENT') {
       title = `Ping from ${sender.display_name}`;
       body = event.content.title;
    } else if (event.event_type === 'DONT_PANIC') {
      title = `A message from ${sender.display_name}`;
      body = event.content.message;
    } else if (event.event_type === 'WISDOM') {
      title = `A little wisdom from ${sender.display_name}`;
      body = event.content.title;
    }

    const message = {
      to: receiver.expo_push_token,
      sound: 'default',
      title,
      body,
      data: { eventId: event.id },
    };

    await expo.sendPushNotificationsAsync([message]);

    return new Response('ok');

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
}); 