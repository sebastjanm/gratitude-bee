// supabase/functions/decline-favor/index.ts
//
// This function handles the logic when a user declines a favor request.
// 1. It updates the original favor event's status to 'DECLINED'.
// 2. It invokes the 'send-notification' function to inform the original
//    requester that their favor was declined.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { event_id, user_id } = await req.json();

    if (!event_id || !user_id) {
      throw new Error("Missing event_id or user_id");
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Fetch the original event to get details
    const { data: originalEvent, error: fetchError } = await supabaseAdmin
      .from("events")
      .select("*")
      .eq("id", event_id)
      .single();

    if (fetchError || !originalEvent) {
      throw new Error("Original favor event not found.");
    }

    // 2. Update the original event's status to DECLINED
    const { error: updateError } = await supabaseAdmin
      .from("events")
      .update({ status: "DECLINED", event_type: "FAVOR_DECLINED" })
      .eq("id", event_id);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[decline-favor] An unexpected error occurred:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
}); 