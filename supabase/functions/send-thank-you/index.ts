// supabase/functions/send-thank-you/index.ts
//
// This function is triggered when a user taps the "Thank You"
// button on an appreciation notification. It directly invokes
// send-notification to send a simple thank you back.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { sender_id, recipient_id, original_appreciation_title } = await req.json();

    if (!sender_id || !recipient_id) {
      throw new Error("Missing sender_id or recipient_id");
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // This is the payload the send-notification function expects
    const eventPayload = {
      sender_id: sender_id,
      receiver_id: recipient_id,
      event_type: 'PING_RESPONSE',
      content: {
        description: `sent you a ❤️ back!`,
        // Pass the contextual title along
        original_appreciation_title: original_appreciation_title || null,
      },
    };

    // Directly invoke the send-notification function
    const { error: invokeError } = await supabaseAdmin.functions.invoke('send-notification', {
      body: { record: eventPayload },
    });

    if (invokeError) {
      console.error(
        "[send-thank-you] Error invoking send-notification:",
        invokeError.message
      );
      throw invokeError;
    }

    console.log(
      "[send-thank-you] Successfully invoked send-notification for the thank you ping."
    );

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error(
      `[send-thank-you] An unexpected error occurred: ${error.message}`
    );
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
