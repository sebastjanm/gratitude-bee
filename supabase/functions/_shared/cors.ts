// supabase/functions/_shared/cors.ts
//
// This file was created by the assistant to handle CORS headers
// consistently across multiple Supabase Edge Functions.

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}; 