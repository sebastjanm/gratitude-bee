// supabase/functions/credit-points/index.ts
//
// This edge function provides a secure admin endpoint to manually credit points to users.
// It receives user details and event data, validates admin privileges, and inserts
// a new event into the `events` table, which in turn triggers an update to the user's wallet.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Main function to handle requests
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the user's authorization header
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser();

    if (userError) {
        console.error('Error getting user:', userError);
        return new Response(JSON.stringify({ error: 'Authentication error' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401,
        });
    }

    // Check for admin privileges from JWT claims
    if (user?.app_metadata?.is_admin !== true) {
      return new Response(JSON.stringify({ error: 'Access denied: Admin privileges required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    // Parse the request body
    const { receiver_id, event_type, content } = await req.json();

    // Validate input
    if (!receiver_id || !event_type || !content) {
      return new Response(JSON.stringify({ error: 'Missing required fields: receiver_id, event_type, content' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Insert the new event into the events table
    const { error: insertError } = await supabaseAdmin
      .from('events')
      .insert({
        sender_id: user.id, // Admin is the sender
        receiver_id,
        event_type,
        content,
        status: 'COMPLETED', // Directly mark as completed
      });

    if (insertError) {
      console.error('Error inserting event:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to credit points.', details: insertError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    return new Response(JSON.stringify({ message: 'Points credited successfully.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'An unexpected error occurred.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}); 