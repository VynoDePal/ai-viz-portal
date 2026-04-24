import { describe, it, expect, beforeEach } from "vitest";
import {
  logBackupStatus,
  getBackupHealth,
  getBackupHistory,
  getBackupsByType,
  getFailedBackups,
  generateBackupReport,
  isBackupOverdue,
  getBackupRecommendations,
  simulateBackupStatus,
  cleanupOldBackupHistory,
  type BackupStatus,
} from "@/lib/backupMonitoring";

describe("Backup Monitoring", () => {
  beforeEach(() => {
    // Clean up backup history before each test
    cleanupOldBackupHistory();
  });

  describe("logBackupStatus", () => {
    it("should log a successful backup status", () => {
      const status: BackupStatus = {
        id: crypto.randomUUID(),
        type: "full",
        status: "success",
        startTime: new Date(),
        endTime: new Date(),
        duration: 3600,
        size: 1024000,
      };

      logBackupStatus(status);
      const history = getBackupHistory();
      expect(history).toHaveLength(1);
      expect(history[0]).toEqual(status);
    });

    it("should log a failed backup status", () => {
      const status: BackupStatus = {
        id: crypto.randomUUID(),
        type: "full",
        status: "failed",
        startTime: new Date(),
        endTime: new Date(),
        duration: 1800,
        errorMessage: "Backup failed",
      };

      logBackupStatus(status);
      const history = getBackupHistory();
      expect(history).toHaveLength(1);
      expect(history[0].status).toBe("failed");
    });
  });

  describe("getBackupHealth", () => {
    it("should return backup health with no backups", () => {
      const health = getBackupHealth();
      expect(health.lastBackup).toBeNull();
      expect(health.lastSuccessfulBackup).toBeNull();
      expect(health.failureCount).toBe(0);
      expect(health.healthScore).toBe(100);
    });

    it("should calculate health score correctly", () => {
      simulateBackupStatus("full", "success", { duration: 3600, size: 1024000 });
      simulateBackupStatus("full", "success", { duration: 3600, size: 1024000 });
      simulateBackupStatus("full", "failed", { duration: 1800 });

      const health = getBackupHealth();
      expect(health.failureCount).toBe(1);
      expect(health.healthScore).toBeLessThan(100);
    });

    it("should filter by backup type", () => {
      simulateBackupStatus("full", "success", { duration: 3600, size: 1024000 });
      simulateBackupStatus("incremental", "success", { duration: 1800, size: 512000 });

      const fullHealth = getBackupHealth("full");
      const incrementalHealth = getBackupHealth("incremental");

      expect(fullHealth.lastBackup?.type).toBe("full");
      expect(incrementalHealth.lastBackup?.type).toBe("incremental");
    });
  });

  describe("getBackupHistory", () => {
    it("should return backup history", () => {
      simulateBackupStatus("full", "success", { duration: 3600, size: 1024000 });
      simulateBackupStatus("incremental", "success", { duration: 1800, size: 512000 });

      const history = getBackupHistory();
      expect(history).toHaveLength(2);
    });

    it("should limit results", () => {
      for (let i = 0; i < 10; i++) {
        simulateBackupStatus("full", "success", { duration: 3600, size: 1024000 });
      }

      const history = getBackupHistory(5);
      expect(history.length).toBeLessThanOrEqual(5);
    });
  });

  describe("getBackupsByType", () => {
    it("should filter backups by type", () => {
      simulateBackupStatus("full", "success", { duration: 3600, size: 1024000 });
      simulateBackupStatus("incremental", "success", { duration: 1800, size: 512000 });
      simulateBackupStatus("full", "success", { duration: 3600, size: 1024000 });

      const fullBackups = getBackupsByType("full");
      const incrementalBackups = getBackupsByType("incremental");

      expect(fullBackups).toHaveLength(2);
      expect(incrementalBackups).toHaveLength(1);
    });
  });

  describe("getFailedBackups", () => {
    it("should return only failed backups", () => {
      simulateBackupStatus("full", "success", { duration: 3600, size: 1024000 });
      simulateBackupStatus("full", "failed", { duration: 1800, errorMessage: "Error" });
      simulateBackupStatus("incremental", "failed", { duration: 900, errorMessage: "Error" });

      const failedBackups = getFailedBackups();
      expect(failedBackups).toHaveLength(2);
      expect(failedBackups.every((b) => b.status === "failed")).toBe(true);
    });
  });

  describe("generateBackupReport", () => {
    it("should generate a complete backup report", () => {
      simulateBackupStatus("full", "success", { duration: 3600, size: 1024000 });
      simulateBackupStatus("incremental", "success", { duration: 1800, size: 512000 });

      const report = generateBackupReport();

      expect(report.summary).toBeDefined();
      expect(report.fullBackups).toBeDefined();
      expect(report.incrementalBackups).toBeDefined();
      expect(report.pitrStatus).toBeDefined();
      expect(report.storageBackups).toBeDefined();
      expect(report.recentFailures).toBeDefined();
    });
  });

  describe("isBackupOverdue", () => {
    it("should detect overdue backups", () => {
      simulateBackupStatus("full", "success", { duration: 3600, size: 1024000 });

      // Backup should not be overdue immediately
      expect(isBackupOverdue("full", 26)).toBe(false);

      // Simulate old backup by modifying the start time
      const health = getBackupHealth("full");
      if (health.lastBackup) {
        health.lastBackup.startTime = new Date(Date.now() - 27 * 60 * 60 * 1000);
      }

      expect(isBackupOverdue("full", 26)).toBe(true);
    });

    it("should return true when no successful backup exists", () => {
      expect(isBackupOverdue("full", 26)).toBe(true);
    });
  });

  describe("getBackupRecommendations", () => {
    it("should return no recommendations when healthy", () => {
      const recommendations = getBackupRecommendations();
      expect(recommendations).toContain("All backups are operating normally.");
    });

    it("should return recommendations for low health score", () => {
      simulateBackupStatus("full", "failed", { duration: 1800, errorMessage: "Error" });
      simulateBackupStatus("full", "failed", { duration: 1800, errorMessage: "Error" });

      const recommendations = getBackupRecommendations();
      expect(recommendations.length).toBeGreaterThan(1);
      expect(recommendations.some((r) => r.includes("health is below"))).toBe(true);
    });

    it("should recommend investigating multiple failures", () => {
      for (let i = 0; i < 6; i++) {
        simulateBackupStatus("full", "failed", { duration: 1800, errorMessage: "Error" });
      }

      const recommendations = getBackupRecommendations();
      expect(recommendations.some((r) => r.includes("Multiple backup failures"))).toBe(true);
    });
  });

  describe("simulateBackupStatus", () => {
    it("should simulate a successful backup", () => {
      simulateBackupStatus("full", "success", { duration: 3600, size: 1024000 });

      const history = getBackupHistory();
      expect(history).toHaveLength(1);
      expect(history[0].status).toBe("success");
      expect(history[0].duration).toBe(3600);
      expect(history[0].size).toBe(1024000);
    });

    it("should simulate a failed backup", () => {
      simulateBackupStatus("full", "failed", {
        duration: 1800,
        errorMessage: "Backup failed",
      });

      const history = getBackupHistory();
      expect(history).toHaveLength(1);
      expect(history[0].status).toBe("failed");
      expect(history[0].errorMessage).toBe("Backup failed");
    });
  });

  describe("cleanupOldBackupHistory", () => {
    it("should remove old backup entries", () => {
      // Create a backup with old timestamp
      const oldBackup: BackupStatus = {
        id: crypto.randomUUID(),
        type: "full",
        status: "success",
        startTime: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000), // 31 days ago
        endTime: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000),
        duration: 3600,
        size: 1024000,
      };

      logBackupStatus(oldBackup);
      simulateBackupStatus("full", "success", { duration: 3600, size: 1024000 });

      cleanupOldBackupHistory();

      const history = getBackupHistory();
      expect(history).toHaveLength(1);
      expect(history[0].id).not.toBe(oldBackup.id);
    });
  });
});
