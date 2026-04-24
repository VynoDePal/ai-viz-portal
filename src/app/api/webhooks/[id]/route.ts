/**
 * Webhook management API endpoint
 */

import { NextRequest, NextResponse } from "next/server";
import {
  createWebhook,
  getWebhook,
  updateWebhook,
  deleteWebhook,
  testWebhook,
  getWebhookDeliveryHistory,
  validateWebhookUrl,
  validateWebhookEvents,
  type WebhookConfig,
} from "@/lib/webhookUtils";

// POST /api/webhooks/[id] - Create webhook (if id is "new") or update webhook
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body: Partial<WebhookConfig> = await request.json();

    // Validate URL
    if (body.url && !validateWebhookUrl(body.url)) {
      return NextResponse.json({ error: "Invalid webhook URL" }, { status: 400 });
    }

    // Validate events
    if (body.events && !validateWebhookEvents(body.events)) {
      return NextResponse.json({ error: "Invalid webhook events" }, { status: 400 });
    }

    const config: WebhookConfig = {
      url: body.url || "",
      secret: body.secret,
      events: body.events || [],
      headers: body.headers,
      retryConfig: body.retryConfig || { maxRetries: 3, retryDelay: 5000 },
      active: body.active !== undefined ? body.active : true,
    };

    if (id === "new") {
      const webhookId = createWebhook(config);
      return NextResponse.json({ id: webhookId, config }, { status: 201 });
    } else {
      const updated = updateWebhook(id, config);
      if (!updated) {
        return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
      }
      return NextResponse.json({ id, config });
    }
  } catch (error) {
    console.error("Error creating/updating webhook:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/webhooks/[id] - Get webhook details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const webhook = getWebhook(id);

    if (!webhook) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
    }

    const deliveryHistory = getWebhookDeliveryHistory(id);

    return NextResponse.json({
      id,
      config: webhook,
      deliveryHistory,
    });
  } catch (error) {
    console.error("Error getting webhook:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/webhooks/[id] - Update webhook
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body: Partial<WebhookConfig> = await request.json();

    // Validate URL if provided
    if (body.url && !validateWebhookUrl(body.url)) {
      return NextResponse.json({ error: "Invalid webhook URL" }, { status: 400 });
    }

    // Validate events if provided
    if (body.events && !validateWebhookEvents(body.events)) {
      return NextResponse.json({ error: "Invalid webhook events" }, { status: 400 });
    }

    const updated = updateWebhook(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
    }

    const webhook = getWebhook(id);
    return NextResponse.json({ id, config: webhook });
  } catch (error) {
    console.error("Error updating webhook:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/webhooks/[id] - Delete webhook
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const deleted = deleteWebhook(id);

    if (!deleted) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting webhook:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
