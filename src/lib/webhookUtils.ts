/**
 * Webhook utilities for external integrations
 */

import { createHash, timingSafeEqual } from "crypto";

export interface WebhookConfig {
  url: string;
  secret?: string;
  events: string[];
  headers?: Record<string, string>;
  retryConfig?: {
    maxRetries: number;
    retryDelay: number; // in milliseconds
  };
  active: boolean;
}

export interface WebhookPayload {
  event: string;
  data: any;
  timestamp: Date;
  id: string;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  status: "success" | "failed" | "pending" | "retrying";
  attempt: number;
  timestamp: Date;
  responseStatus?: number;
  errorMessage?: string;
  retryAfter?: Date;
}

// In-memory webhook store (for development)
// In production, use database
const webhookStore = new Map<string, WebhookConfig>();
const deliveryHistory = new Map<string, WebhookDelivery[]>();

/**
 * Generate webhook signature
 */
export function generateWebhookSignature(
  payload: string,
  secret: string,
  algorithm: string = "sha256"
): string {
  const hmac = createHash(algorithm);
  hmac.update(payload);
  hmac.update(secret);
  return `${algorithm}=${hmac.digest("hex")}`;
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
  algorithm: string = "sha256"
): boolean {
  const expectedSignature = generateWebhookSignature(payload, secret, algorithm);
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

/**
 * Create webhook configuration
 */
export function createWebhook(config: WebhookConfig): string {
  const id = crypto.randomUUID();
  webhookStore.set(id, config);
  return id;
}

/**
 * Get webhook configuration
 */
export function getWebhook(id: string): WebhookConfig | null {
  return webhookStore.get(id) || null;
}

/**
 * Update webhook configuration
 */
export function updateWebhook(id: string, config: Partial<WebhookConfig>): boolean {
  const existing = webhookStore.get(id);
  if (!existing) return false;
  
  webhookStore.set(id, { ...existing, ...config });
  return true;
}

/**
 * Delete webhook
 */
export function deleteWebhook(id: string): boolean {
  return webhookStore.delete(id);
}

/**
 * List all webhooks
 */
export function listWebhooks(): Array<{ id: string; config: WebhookConfig }> {
  return Array.from(webhookStore.entries()).map(([id, config]) => ({ id, config }));
}

/**
 * List webhooks by event
 */
export function listWebhooksByEvent(event: string): Array<{ id: string; config: WebhookConfig }> {
  return listWebhooks().filter(({ config }) => config.events.includes(event));
}

/**
 * Send webhook
 */
export async function sendWebhook(
  webhookId: string,
  payload: WebhookPayload
): Promise<WebhookDelivery> {
  const webhook = getWebhook(webhookId);
  if (!webhook) {
    throw new Error("Webhook not found");
  }

  if (!webhook.active) {
    throw new Error("Webhook is inactive");
  }

  const deliveryId = crypto.randomUUID();
  const delivery: WebhookDelivery = {
    id: deliveryId,
    webhookId,
    status: "pending",
    attempt: 1,
    timestamp: new Date(),
  };

  // Add to delivery history
  if (!deliveryHistory.has(webhookId)) {
    deliveryHistory.set(webhookId, []);
  }
  deliveryHistory.get(webhookId)!.push(delivery);

  try {
    const payloadString = JSON.stringify(payload);
    const signature = webhook.secret
      ? generateWebhookSignature(payloadString, webhook.secret)
      : undefined;

    const response = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-ID": deliveryId,
        "X-Webhook-Event": payload.event,
        "X-Webhook-Timestamp": payload.timestamp.toISOString(),
        "X-Webhook-Signature": signature || "",
        ...webhook.headers,
      },
      body: payloadString,
    });

    delivery.status = response.ok ? "success" : "failed";
    delivery.responseStatus = response.status;

    if (!response.ok) {
      const errorText = await response.text();
      delivery.errorMessage = errorText || `HTTP ${response.status}`;
    }
  } catch (error) {
    delivery.status = "failed";
    delivery.errorMessage = error instanceof Error ? error.message : "Unknown error";
  }

  return delivery;
}

/**
 * Send webhook with retry logic
 */
export async function sendWebhookWithRetry(
  webhookId: string,
  payload: WebhookPayload
): Promise<WebhookDelivery> {
  const webhook = getWebhook(webhookId);
  if (!webhook) {
    throw new Error("Webhook not found");
  }

  const maxRetries = webhook.retryConfig?.maxRetries || 3;
  const retryDelay = webhook.retryConfig?.retryDelay || 5000;

  let lastDelivery: WebhookDelivery;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    lastDelivery = await sendWebhook(webhookId, payload);
    lastDelivery.attempt = attempt;

    if (lastDelivery.status === "success") {
      return lastDelivery;
    }

    if (attempt <= maxRetries) {
      lastDelivery.status = "retrying";
      lastDelivery.retryAfter = new Date(Date.now() + retryDelay * attempt);
      await new Promise((resolve) => setTimeout(resolve, retryDelay * attempt));
    }
  }

  return lastDelivery!;
}

/**
 * Send webhook to all matching event webhooks
 */
export async function sendWebhooksForEvent(event: string, data: any): Promise<WebhookDelivery[]> {
  const webhooks = listWebhooksByEvent(event);
  const payload: WebhookPayload = {
    event,
    data,
    timestamp: new Date(),
    id: crypto.randomUUID(),
  };

  const deliveries: WebhookDelivery[] = [];

  for (const { id: webhookId } of webhooks) {
    try {
      const delivery = await sendWebhookWithRetry(webhookId, payload);
      deliveries.push(delivery);
    } catch (error) {
      console.error(`Failed to send webhook ${webhookId}:`, error);
    }
  }

  return deliveries;
}

/**
 * Get webhook delivery history
 */
export function getWebhookDeliveryHistory(webhookId: string, limit: number = 100): WebhookDelivery[] {
  const history = deliveryHistory.get(webhookId) || [];
  return history.slice(-limit);
}

/**
 * Get all webhook delivery history
 */
export function getAllDeliveryHistory(limit: number = 100): WebhookDelivery[] {
  const allDeliveries: WebhookDelivery[] = [];
  
  for (const history of deliveryHistory.values()) {
    allDeliveries.push(...history);
  }
  
  return allDeliveries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);
}

/**
 * Test webhook
 */
export async function testWebhook(webhookId: string): Promise<WebhookDelivery> {
  const testPayload: WebhookPayload = {
    event: "test",
    data: {
      message: "This is a test webhook",
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date(),
    id: crypto.randomUUID(),
  };

  return sendWebhookWithRetry(webhookId, testPayload);
}

/**
 * Validate webhook URL
 */
export function validateWebhookUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Validate webhook events
 */
export function validateWebhookEvents(events: string[]): boolean {
  const validEvents = [
    "model.update",
    "model.delete",
    "benchmark.update",
    "benchmark.score_change",
    "model.release",
    "custom",
    "test",
  ];

  return events.every((event) => validEvents.includes(event));
}

/**
 * Clean up old delivery history
 */
export function cleanupOldDeliveries(webhookId: string, maxAge: number = 7 * 24 * 60 * 60 * 1000): void {
  const history = deliveryHistory.get(webhookId);
  if (!history) return;

  const now = Date.now();
  const filtered = history.filter((delivery) => delivery.timestamp.getTime() > now - maxAge);
  deliveryHistory.set(webhookId, filtered);
}

// Run cleanup every day
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    for (const webhookId of deliveryHistory.keys()) {
      cleanupOldDeliveries(webhookId);
    }
  }, 86400000);
}
