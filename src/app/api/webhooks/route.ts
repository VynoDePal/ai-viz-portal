/**
 * Webhook API endpoint for receiving and managing webhooks
 */

import { NextRequest, NextResponse } from "next/server";
import {
  verifyWebhookSignature,
  sendWebhooksForEvent,
  createWebhook,
  getWebhook,
  updateWebhook,
  deleteWebhook,
  listWebhooks,
  testWebhook,
  validateWebhookUrl,
  validateWebhookEvents,
  getWebhookDeliveryHistory,
  type WebhookConfig,
} from "@/lib/webhookUtils";

// POST /api/webhooks - Receive incoming webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-webhook-signature");
    const webhookId = request.headers.get("x-webhook-id");
    const event = request.headers.get("x-webhook-event");

    // Verify webhook signature if secret is configured
    if (webhookId && signature) {
      const webhook = getWebhook(webhookId);
      if (webhook && webhook.secret) {
        const isValid = verifyWebhookSignature(body, signature, webhook.secret);
        if (!isValid) {
          return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }
      }
    }

    // Process webhook payload
    const payload = JSON.parse(body);
    
    // Trigger any configured webhooks for this event
    if (event) {
      await sendWebhooksForEvent(event, payload);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/webhooks - List all webhooks
export async function GET(request: NextRequest) {
  try {
    const webhooks = listWebhooks();
    return NextResponse.json({ webhooks });
  } catch (error) {
    console.error("Error listing webhooks:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
