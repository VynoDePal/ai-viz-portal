import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  generateWebhookSignature,
  verifyWebhookSignature,
  createWebhook,
  getWebhook,
  updateWebhook,
  deleteWebhook,
  listWebhooks,
  listWebhooksByEvent,
  sendWebhook,
  sendWebhookWithRetry,
  sendWebhooksForEvent,
  getWebhookDeliveryHistory,
  getAllDeliveryHistory,
  testWebhook,
  validateWebhookUrl,
  validateWebhookEvents,
  cleanupOldDeliveries,
  type WebhookConfig,
} from "@/lib/webhookUtils";

// Mock fetch for webhook sending
global.fetch = vi.fn();

describe("Webhook Utilities", () => {
  beforeEach(() => {
    // Clear webhook store and delivery history before each test
    vi.clearAllMocks();
  });

  describe("generateWebhookSignature", () => {
    it("should generate a signature", () => {
      const payload = "test payload";
      const secret = "test secret";
      const signature = generateWebhookSignature(payload, secret);
      expect(signature).toBeDefined();
      expect(signature).toContain("sha256=");
    });

    it("should generate consistent signatures", () => {
      const payload = "test payload";
      const secret = "test secret";
      const signature1 = generateWebhookSignature(payload, secret);
      const signature2 = generateWebhookSignature(payload, secret);
      expect(signature1).toBe(signature2);
    });
  });

  describe("verifyWebhookSignature", () => {
    it("should verify a valid signature", () => {
      const payload = "test payload";
      const secret = "test secret";
      const signature = generateWebhookSignature(payload, secret);
      const isValid = verifyWebhookSignature(payload, signature, secret);
      expect(isValid).toBe(true);
    });

    it("should reject an invalid signature", () => {
      const payload = "test payload";
      const secret = "test secret";
      const signature = "invalid signature";
      const isValid = verifyWebhookSignature(payload, signature, secret);
      expect(isValid).toBe(false);
    });
  });

  describe("createWebhook", () => {
    it("should create a webhook", () => {
      const config: WebhookConfig = {
        url: "https://example.com/webhook",
        events: ["model.update"],
        active: true,
      };
      const id = createWebhook(config);
      expect(id).toBeDefined();
      expect(typeof id).toBe("string");
    });

    it("should store webhook configuration", () => {
      const config: WebhookConfig = {
        url: "https://example.com/webhook",
        secret: "test secret",
        events: ["model.update"],
        active: true,
      };
      const id = createWebhook(config);
      const webhook = getWebhook(id);
      expect(webhook).toEqual(config);
    });
  });

  describe("getWebhook", () => {
    it("should retrieve a webhook", () => {
      const config: WebhookConfig = {
        url: "https://example.com/webhook",
        events: ["model.update"],
        active: true,
      };
      const id = createWebhook(config);
      const webhook = getWebhook(id);
      expect(webhook).toEqual(config);
    });

    it("should return null for non-existent webhook", () => {
      const webhook = getWebhook("non-existent");
      expect(webhook).toBeNull();
    });
  });

  describe("updateWebhook", () => {
    it("should update a webhook", () => {
      const config: WebhookConfig = {
        url: "https://example.com/webhook",
        events: ["model.update"],
        active: true,
      };
      const id = createWebhook(config);
      const updated = updateWebhook(id, { active: false });
      expect(updated).toBe(true);
      const webhook = getWebhook(id);
      expect(webhook?.active).toBe(false);
    });

    it("should return false for non-existent webhook", () => {
      const updated = updateWebhook("non-existent", { active: false });
      expect(updated).toBe(false);
    });
  });

  describe("deleteWebhook", () => {
    it("should delete a webhook", () => {
      const config: WebhookConfig = {
        url: "https://example.com/webhook",
        events: ["model.update"],
        active: true,
      };
      const id = createWebhook(config);
      const deleted = deleteWebhook(id);
      expect(deleted).toBe(true);
      expect(getWebhook(id)).toBeNull();
    });

    it("should return false for non-existent webhook", () => {
      const deleted = deleteWebhook("non-existent");
      expect(deleted).toBe(false);
    });
  });

  describe("listWebhooks", () => {
    it("should list all webhooks", () => {
      const config1: WebhookConfig = {
        url: "https://example.com/webhook1",
        events: ["model.update"],
        active: true,
      };
      const config2: WebhookConfig = {
        url: "https://example.com/webhook2",
        events: ["benchmark.update"],
        active: true,
      };
      createWebhook(config1);
      createWebhook(config2);
      const webhooks = listWebhooks();
      expect(webhooks).toHaveLength(2);
    });
  });

  describe("listWebhooksByEvent", () => {
    it("should filter webhooks by event", () => {
      const config1: WebhookConfig = {
        url: "https://example.com/webhook1",
        events: ["model.update"],
        active: true,
      };
      const config2: WebhookConfig = {
        url: "https://example.com/webhook2",
        events: ["benchmark.update"],
        active: true,
      };
      createWebhook(config1);
      createWebhook(config2);
      const webhooks = listWebhooksByEvent("model.update");
      expect(webhooks).toHaveLength(1);
    });
  });

  describe("sendWebhook", () => {
    it("should send a webhook successfully", async () => {
      const config: WebhookConfig = {
        url: "https://example.com/webhook",
        events: ["model.update"],
        active: true,
      };
      const id = createWebhook(config);
      
      (global.fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => "OK",
      });

      const payload = {
        event: "model.update",
        data: { id: 1 },
        timestamp: new Date(),
        id: crypto.randomUUID(),
      };

      const delivery = await sendWebhook(id, payload);
      expect(delivery.status).toBe("success");
      expect(delivery.responseStatus).toBe(200);
    });

    it("should handle webhook failure", async () => {
      const config: WebhookConfig = {
        url: "https://example.com/webhook",
        events: ["model.update"],
        active: true,
      };
      const id = createWebhook(config);
      
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => "Internal Server Error",
      });

      const payload = {
        event: "model.update",
        data: { id: 1 },
        timestamp: new Date(),
        id: crypto.randomUUID(),
      };

      const delivery = await sendWebhook(id, payload);
      expect(delivery.status).toBe("failed");
      expect(delivery.responseStatus).toBe(500);
    });

    it("should throw error for inactive webhook", async () => {
      const config: WebhookConfig = {
        url: "https://example.com/webhook",
        events: ["model.update"],
        active: false,
      };
      const id = createWebhook(config);

      const payload = {
        event: "model.update",
        data: { id: 1 },
        timestamp: new Date(),
        id: crypto.randomUUID(),
      };

      await expect(sendWebhook(id, payload)).rejects.toThrow("Webhook is inactive");
    });
  });

  describe("sendWebhookWithRetry", () => {
    it("should retry failed webhooks", async () => {
      const config: WebhookConfig = {
        url: "https://example.com/webhook",
        events: ["model.update"],
        active: true,
        retryConfig: { maxRetries: 2, retryDelay: 100 },
      };
      const id = createWebhook(config);
      
      let attemptCount = 0;
      (global.fetch as any).mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          return Promise.resolve({
            ok: false,
            status: 500,
            text: async () => "Internal Server Error",
          });
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          text: async () => "OK",
        });
      });

      const payload = {
        event: "model.update",
        data: { id: 1 },
        timestamp: new Date(),
        id: crypto.randomUUID(),
      };

      const delivery = await sendWebhookWithRetry(id, payload);
      expect(delivery.status).toBe("success");
      expect(attemptCount).toBe(3);
    });
  });

  describe("validateWebhookUrl", () => {
    it("should validate a valid HTTP URL", () => {
      expect(validateWebhookUrl("http://example.com/webhook")).toBe(true);
    });

    it("should validate a valid HTTPS URL", () => {
      expect(validateWebhookUrl("https://example.com/webhook")).toBe(true);
    });

    it("should reject an invalid URL", () => {
      expect(validateWebhookUrl("invalid-url")).toBe(false);
    });

    it("should reject a non-HTTP/HTTPS URL", () => {
      expect(validateWebhookUrl("ftp://example.com/webhook")).toBe(false);
    });
  });

  describe("validateWebhookEvents", () => {
    it("should validate valid events", () => {
      expect(validateWebhookEvents(["model.update", "benchmark.update"])).toBe(true);
    });

    it("should reject invalid events", () => {
      expect(validateWebhookEvents(["invalid.event"])).toBe(false);
    });
  });
});
