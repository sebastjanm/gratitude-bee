// supabase/functions/mark-notification-read/index.ts
//
// This function updates the `read` status of a notification.
// It's called when a user opens a notification from the detail modal.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { notification_id } = await req.json();

    if (!notification_id) {
      throw new Error("Missing notification_id");
    }
    
    // Create a client with the user's auth context
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: { Authorization: `Bearer ${req.headers.get('Authorization')!}` },
      },
    });

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notification_id);

    if (error) {
      console.error(`[mark-read] Error updating notification: ${error.message}`);
      throw error;
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error(`[mark-read] An unexpected error occurred: ${error.message}`);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}); 