/**
 * Backup monitoring utilities for tracking backup health and status
 */

export interface BackupStatus {
  id: string;
  type: "full" | "incremental" | "pitr" | "storage";
  status: "success" | "failed" | "in_progress" | "pending";
  startTime: Date;
  endTime?: Date;
  duration?: number; // in seconds
  size?: number; // in bytes
  errorMessage?: string;
}

export interface BackupHealth {
  lastBackup: BackupStatus | null;
  lastSuccessfulBackup: BackupStatus | null;
  failureCount: number;
  averageDuration: number;
  totalSize: number;
  healthScore: number; // 0-100
}

const backupHistory: BackupStatus[] = [];

/**
 * Log backup status
 */
export function logBackupStatus(status: BackupStatus): void {
  backupHistory.push(status);

  // Keep only last 1000 entries
  if (backupHistory.length > 1000) {
    backupHistory.shift();
  }

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log(`[BACKUP] ${status.type.toUpperCase()}: ${status.status}`, {
      duration: status.duration,
      size: status.size,
    });
  }

  // Send alert on failure
  if (status.status === "failed") {
    sendBackupAlert(status);
  }
}

/**
 * Get backup health status
 */
export function getBackupHealth(backupType?: BackupStatus["type"]): BackupHealth {
  const filteredBackups = backupType
    ? backupHistory.filter((b) => b.type === backupType)
    : backupHistory;

  const lastBackup = filteredBackups[filteredBackups.length - 1] || null;
  const successfulBackups = filteredBackups.filter((b) => b.status === "success");
  const lastSuccessfulBackup = successfulBackups[successfulBackups.length - 1] || null;
  const failedBackups = filteredBackups.filter((b) => b.status === "failed");
  const failureCount = failedBackups.length;

  // Calculate average duration
  const completedBackups = filteredBackups.filter((b) => b.duration !== undefined);
  const averageDuration =
    completedBackups.length > 0
      ? completedBackups.reduce((sum, b) => sum + (b.duration || 0), 0) / completedBackups.length
      : 0;

  // Calculate total size
  const totalSize = successfulBackups.reduce((sum, b) => sum + (b.size || 0), 0);

  // Calculate health score
  const recentBackups = filteredBackups.slice(-10);
  const recentSuccessRate =
    recentBackups.length > 0
      ? recentBackups.filter((b) => b.status === "success").length / recentBackups.length
      : 1;
  const healthScore = Math.round(recentSuccessRate * 100);

  return {
    lastBackup,
    lastSuccessfulBackup,
    failureCount,
    averageDuration,
    totalSize,
    healthScore,
  };
}

/**
 * Get backup history
 */
export function getBackupHistory(limit: number = 100): BackupStatus[] {
  return backupHistory.slice(-limit);
}

/**
 * Get backups by type
 */
export function getBackupsByType(type: BackupStatus["type"], limit: number = 100): BackupStatus[] {
  return backupHistory.filter((b) => b.type === type).slice(-limit);
}

/**
 * Get failed backups
 */
export function getFailedBackups(limit: number = 100): BackupStatus[] {
  return backupHistory.filter((b) => b.status === "failed").slice(-limit);
}

/**
 * Send backup alert on failure
 */
function sendBackupAlert(status: BackupStatus): void {
  const webhookUrl = process.env.BACKUP_ALERT_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.error("[BACKUP ALERT] No webhook URL configured");
    return;
  }

  try {
    fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        attachments: [
          {
            color: "#ff0000",
            title: "Backup Failed",
            text: `Backup of type ${status.type} failed`,
            fields: [
              {
                title: "Type",
                value: status.type.toUpperCase(),
                short: true,
              },
              {
                title: "Start Time",
                value: status.startTime.toISOString(),
                short: true,
              },
              {
                title: "Error",
                value: status.errorMessage || "Unknown error",
                short: false,
              },
            ],
            footer: "AI Viz Portal Backup Monitoring",
          },
        ],
      }),
    });
  } catch (error) {
    console.error("[BACKUP ALERT] Failed to send alert:", error);
  }
}

/**
 * Generate backup report
 */
export function generateBackupReport(): {
  summary: BackupHealth;
  fullBackups: BackupHealth;
  incrementalBackups: BackupHealth;
  pitrStatus: BackupHealth;
  storageBackups: BackupHealth;
  recentFailures: BackupStatus[];
} {
  const summary = getBackupHealth();
  const fullBackups = getBackupHealth("full");
  const incrementalBackups = getBackupHealth("incremental");
  const pitrStatus = getBackupHealth("pitr");
  const storageBackups = getBackupHealth("storage");
  const recentFailures = getFailedBackups(10);

  return {
    summary,
    fullBackups,
    incrementalBackups,
    pitrStatus,
    storageBackups,
    recentFailures,
  };
}

/**
 * Check if backup is overdue
 */
export function isBackupOverdue(
  backupType: BackupStatus["type"],
  maxAgeHours: number
): boolean {
  const health = getBackupHealth(backupType);
  
  if (!health.lastSuccessfulBackup) {
    return true;
  }

  const ageHours = (Date.now() - health.lastSuccessfulBackup.startTime.getTime()) / (1000 * 60 * 60);
  return ageHours > maxAgeHours;
}

/**
 * Get backup recommendations
 */
export function getBackupRecommendations(): string[] {
  const recommendations: string[] = [];
  const report = generateBackupReport();

  // Check health scores
  if (report.summary.healthScore < 90) {
    recommendations.push("Overall backup health is below 90%. Investigate recent failures.");
  }

  if (report.fullBackups.healthScore < 90) {
    recommendations.push("Full backup health is below 90%. Check full backup configuration.");
  }

  if (report.incrementalBackups.healthScore < 90) {
    recommendations.push("Incremental backup health is below 90%. Check incremental backup configuration.");
  }

  // Check for overdue backups
  if (isBackupOverdue("full", 26)) {
    recommendations.push("Full backup is overdue (more than 26 hours). Investigate immediately.");
  }

  if (isBackupOverdue("incremental", 5)) {
    recommendations.push("Incremental backup is overdue (more than 5 hours). Investigate immediately.");
  }

  // Check failure count
  if (report.summary.failureCount > 5) {
    recommendations.push(`Multiple backup failures detected (${report.summary.failureCount}). Review error logs.`);
  }

  // Check recent failures
  if (report.recentFailures.length > 2) {
    recommendations.push("Multiple recent backup failures. Immediate attention required.");
  }

  if (recommendations.length === 0) {
    recommendations.push("All backups are operating normally.");
  }

  return recommendations;
}

/**
 * Simulate backup status (for testing)
 */
export function simulateBackupStatus(
  type: BackupStatus["type"],
  status: BackupStatus["status"],
  options?: {
    duration?: number;
    size?: number;
    errorMessage?: string;
  }
): void {
  const startTime = new Date();
  const endTime = status === "success" || status === "failed" ? new Date() : undefined;
  const duration = options?.duration ? options.duration : (endTime ? (endTime.getTime() - startTime.getTime()) / 1000 : undefined);

  logBackupStatus({
    id: crypto.randomUUID(),
    type,
    status,
    startTime,
    endTime,
    duration,
    size: options?.size,
    errorMessage: options?.errorMessage,
  });
}

/**
 * Clean up old backup history
 */
export function cleanupOldBackupHistory(): void {
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  
  for (let i = backupHistory.length - 1; i >= 0; i--) {
    if (backupHistory[i].startTime.getTime() < thirtyDaysAgo) {
      backupHistory.splice(i, 1);
    }
  }
}

// Run cleanup every day
if (typeof setInterval !== "undefined") {
  setInterval(cleanupOldBackupHistory, 86400000);
}
