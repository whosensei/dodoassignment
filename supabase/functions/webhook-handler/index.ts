// supabase/functions/webhook-handler/index.ts
import { Webhook } from "npm:standardwebhooks@1.0.0";
import { createClient } from "npm:@supabase/supabase-js@2.39.5";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, webhook-id, webhook-signature, webhook-timestamp',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
// Initialize Supabase Admin client
const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
// Initialize webhook
const webhook = new Webhook(Deno.env.get("DODO_WEBHOOK_SECRET") || "");
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { 
        status: 405, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }

  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);
    const stringifiedBody = JSON.stringify(body);

    // Collect headers
    const webhookHeaders = {
      "webhook-id": req.headers.get("webhook-id") || "",
      "webhook-signature": req.headers.get("webhook-signature") || "",
      "webhook-timestamp": req.headers.get("webhook-timestamp") || ""
    };

    // Verify webhook signature
    const verifiedPayload = await webhook.verify(stringifiedBody, webhookHeaders);

    const { error } = await supabaseAdmin
      .from("subscription_events")
      .insert({
        event_type: (verifiedPayload as any).type || "unknown",
        payload: verifiedPayload,
        subscription_id: (verifiedPayload as any).data?.subscription_id ?? null,
        product_id: (verifiedPayload as any).data?.product_cart?.[0]?.product_id ?? null,
        customer_id: (verifiedPayload as any).data?.customer?.customer_id ?? null
      });

    if (error) {
      return new Response(
        JSON.stringify({ error: "Failed to store event" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ received: true, stored: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Webhook handler failed" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
