/**
 * Security alerting system for DDoS attacks and suspicious activity
 */

export interface SecurityAlert {
  id: string;
  type: "ddos" | "rate_limit" | "blocked_ip" | "suspicious";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  ip?: string;
  userId?: string;
  timestamp: Date;
  details?: Record<string, any>;
}

const alertHistory: SecurityAlert[] = [];

/**
 * Send security alert
 */
export function sendSecurityAlert(alert: Omit<SecurityAlert, "id" | "timestamp">): SecurityAlert {
  const fullAlert: SecurityAlert = {
    ...alert,
    id: crypto.randomUUID(),
    timestamp: new Date(),
  };

  alertHistory.push(fullAlert);

  // Keep only last 1000 alerts
  if (alertHistory.length > 1000) {
    alertHistory.shift();
  }

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.error("[SECURITY ALERT]", fullAlert);
  }

  // In production, send to monitoring service
  if (process.env.NODE_ENV === "production") {
    // Send to external monitoring service (e.g., Sentry, Datadog)
    // Or send Slack webhook notification
    sendToSlack(fullAlert);
  }

  return fullAlert;
}

/**
 * Send alert to Slack webhook
 */
async function sendToSlack(alert: SecurityAlert): Promise<void> {
  const webhookUrl = process.env.SECURITY_ALERT_WEBHOOK_URL;
  
  if (!webhookUrl) {
    return;
  }

  try {
    const color = getSeverityColor(alert.severity);
    
    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        attachments: [
          {
            color,
            title: `Security Alert: ${alert.type.toUpperCase()}`,
            text: alert.message,
            fields: [
              {
                title: "Severity",
                value: alert.severity.toUpperCase(),
                short: true,
              },
              {
                title: "IP",
                value: alert.ip || "N/A",
                short: true,
              },
              {
                title: "Timestamp",
                value: alert.timestamp.toISOString(),
                short: true,
              },
            ],
            footer: "AI Viz Portal Security",
          },
        ],
      }),
    });
  } catch (error) {
    console.error("Failed to send security alert to Slack:", error);
  }
}

/**
 * Get severity color for Slack
 */
function getSeverityColor(severity: SecurityAlert["severity"]): string {
  switch (severity) {
    case "low":
      return "#36a64f"; // green
    case "medium":
      return "#ff9900"; // orange
    case "high":
      return "#ff0000"; // red
    case "critical":
      return "#000000"; // black
    default:
      return "#cccccc"; // gray
  }
}

/**
 * Get alert history
 */
export function getAlertHistory(limit: number = 100): SecurityAlert[] {
  return alertHistory.slice(-limit);
}

/**
 * Get alerts by type
 */
export function getAlertsByType(type: SecurityAlert["type"], limit: number = 100): SecurityAlert[] {
  return alertHistory
    .filter((alert) => alert.type === type)
    .slice(-limit);
}

/**
 * Get alerts by severity
 */
export function getAlertsBySeverity(severity: SecurityAlert["severity"], limit: number = 100): SecurityAlert[] {
  return alertHistory
    .filter((alert) => alert.severity === severity)
    .slice(-limit);
}

/**
 * Clear old alerts (older than 24 hours)
 */
export function cleanupOldAlerts(): void {
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  
  for (let i = alertHistory.length - 1; i >= 0; i--) {
    if (alertHistory[i].timestamp.getTime() < oneDayAgo) {
      alertHistory.splice(i, 1);
    }
  }
}

// Run cleanup every hour
if (typeof setInterval !== "undefined") {
  setInterval(cleanupOldAlerts, 3600000);
}
