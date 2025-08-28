//locally , setup using ngrok to use this
import { NextRequest, NextResponse } from "next/server";
import { Webhook, WebhookUnbrandedRequiredHeaders } from "standardwebhooks";
import { supabaseAdmin } from "@/lib/supabaseClient";

const webhook = new Webhook(process.env.DODO_WEBHOOK_SECRET || "");

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    const webhookHeaders: WebhookUnbrandedRequiredHeaders = {
      "webhook-id": req.headers.get("webhook-id") || "",
      "webhook-signature": req.headers.get("webhook-signature") || "",
      "webhook-timestamp": req.headers.get("webhook-timestamp") || "",
    };

    const verifiedPayload = await webhook.verify(rawBody, webhookHeaders);

    console.log("Verified webhook:", verifiedPayload);

    const { error } = await supabaseAdmin
      .from('subscription_events')
      .insert({
        event_type: (verifiedPayload as any).type || 'unknown',
        payload: verifiedPayload,
        //@ts-ignore
        subscription_id: verifiedPayload.data?.subscription_id || null,
        //@ts-ignore
        product_id: verifiedPayload.data?.product_id || null,
        //@ts-ignore
        customer_id: verifiedPayload.data?.customer.customer_id || null,
      });

    if (error) {
      console.error('Failed to store webhook event:', error);
      return NextResponse.json({ error: "Failed to store event" }, { status: 500 });
    }

    console.log('Webhook event stored successfully');
    return NextResponse.json({ received: true, stored: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 400 });
  }
}