// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
//
// Repurposed to handle various notification types based on the event.
// All events that should trigger a push notification are sent here.
//
// Changes:
// - Fixed authentication issue by using a single Supabase admin client.
// - Added logic to store a record in the `notifications` table before sending.
// - Included `notification_id` in the push payload for client-side handling.
// - Added `categoryIdentifier` for interactive notifications.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { record: event } = await req.json();
    console.log(`--- [send-notification] START ---`);
    console.log(`Received event:`, JSON.stringify(event, null, 2));

    if (!event || !event.sender_id || !event.receiver_id) {
      console.error('Invalid event data received.');
      return new Response(JSON.stringify({ error: "Invalid event data" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Use one admin client for all DB operations in this function
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    console.log('Supabase admin client initialized.');

    console.log(`Fetching sender: ${event.sender_id}`);
    const { data: sender, error: senderError } = await supabaseAdmin
      .from('users')
      .select('display_name')
      .eq('id', event.sender_id)
      .single();

    if (senderError) throw new Error(`Error fetching sender: ${senderError.message}`);
    console.log('Sender found:', sender.display_name);

    console.log(`Fetching receiver: ${event.receiver_id}`);
    const { data: receiver, error: receiverError } = await supabaseAdmin
      .from('users')
      .select('expo_push_token')
      .eq('id', event.receiver_id)
      .single();

    if (receiverError) throw new Error(`Error fetching receiver: ${receiverError.message}`);
    console.log('Receiver token found.');
    
    if (!receiver.expo_push_token) {
      console.log(`Receiver ${event.receiver_id} has no push token. Skipping.`);
      return new Response(JSON.stringify({ message: "No push token for receiver" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    let title = 'New Gratitude Bee message';
    let body = 'You have a new message from your partner.';
    let categoryIdentifier = 'default';
    const content = event.content || {};

    switch (event.event_type) {
      case 'APPRECIATION':
        title = `New Appreciation from ${sender.display_name}! 🧡`;
        body = `${content.title || 'They sent you some love.'}`;
        if (content.points) {
            body += ` (+${content.points} ${content.points_icon || 'point'})`;
        }
        categoryIdentifier = 'appreciation';
        break;
      case 'FAVOR_REQUEST':
        title = `New Favor Request from ${sender.display_name}! 🙏`;
        body = `${content.title || 'They need your help with something.'}`;
        categoryIdentifier = 'favor_request';
        break;
      case 'FAVOR_ACCEPTED':
        title = `Favor Accepted! ✅`;
        body = content.description || 'Your partner accepted your favor request.';
        categoryIdentifier = 'favor_response';
        break;
      case 'FAVOR_DECLINED':
        title = `Favor Declined ❌`;
        body = content.description || 'Your partner declined your favor request.';
        categoryIdentifier = 'favor_response';
        break;
      case 'FAVOR_COMPLETED':
        title = `Favor Completed! ✨`;
        body = `Your partner marked "${content.title}" as complete. You earned ${content.points} points!`;
        categoryIdentifier = 'favor_response';
        break;
      case 'PING':
        title = `Ping from ${sender.display_name}! 👋`;
        body = content.description || 'Just saying hi!';
        categoryIdentifier = 'ping_sent';
        break;
      case 'DONT_PANIC':
        title = `A "Don't Panic" signal from ${sender.display_name}! 🐋`;
        body = content.description || "Everything's going to be okay.";
        categoryIdentifier = 'dont_panic';
        break;
      case 'PING_RESPONSE':
        title = `${sender.display_name} says thank you! ❤️`;
        if (content.original_appreciation_title) {
          body = `For your appreciation: "${content.original_appreciation_title}"`;
        } else {
          body = `For the appreciation you sent.`;
        }
        categoryIdentifier = 'default';
        break;
      case 'WISDOM':
        title = `Wisdom from ${sender.display_name}! 🦉`;
        body = content.description || 'A piece of wisdom has been shared.';
        categoryIdentifier = 'wisdom';
        break;
    }

    const { data: notification, error: notificationError } = await supabaseAdmin
      .from('notifications')
      .insert({
        recipient_id: event.receiver_id,
        sender_id: event.sender_id,
        type: event.event_type,
        content: {
          title: title,
          body: body,
          original_content: content,
        },
      })
      .select('id')
      .single();
    
    if (notificationError) {
      console.error(`[send-notification] Error creating notification record: ${notificationError.message}`);
      throw notificationError;
    }
    
    console.log(`[send-notification] Created notification record: ${notification.id}`);

    const pushMessage = {
      to: receiver.expo_push_token,
      sound: 'default',
      title: title,
      body: body,
      data: {
        notification_id: notification.id,
        event: event,
        senderName: sender.display_name, // Add senderName to the payload
      },
      categoryId: categoryIdentifier,
    };

    console.log("[send-notification] Sending push message:", JSON.stringify(pushMessage, null, 2));

    const expoResponse = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pushMessage),
    });
    
    const expoData = await expoResponse.json();
    console.log("[send-notification] Expo response:", JSON.stringify(expoData, null, 2));

    return new Response(JSON.stringify({ success: true, expoData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error(`[send-notification] An unexpected error occurred: ${error.message}`);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}); 