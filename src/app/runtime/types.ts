// ============================================================================
// Personal OS — 24/7 Runtime Daemon Types & Contracts
// ============================================================================

export type ServiceName =
  | 'scheduler'
  | 'notifications'
  | 'tray'
  | 'auto-start'
  | 'power-monitor'
  | 'watchdog'
  | 'database';

export interface ServiceHealth {
  name: ServiceName;
  status: 'healthy' | 'degraded' | 'failed';
  uptimeSeconds: number;
  lastHeartbeat: string;
  errorCount: number;
  lastError?: string;
}

export interface ScheduledJob {
  id: string;
  type: 'reminder' | 'task_due' | 'habit_prompt' | 'backup' | 'daily_review';
  targetTimestamp: number; // Unix epoch ms
  payload: {
    title: string;
    body: string;
    priority?: 'low' | 'normal' | 'urgent';
    referenceId?: string;
    recurringPattern?: 'daily' | 'weekdays' | 'weekly' | 'hourly';
  };
}

export interface NotificationPayload {
  id: string;
  title: string;
  body: string;
  urgency?: 'low' | 'normal' | 'critical';
  sound?: boolean;
  soundType?: 'chime' | 'alert' | 'urgent';
  actions?: Array<{ action: string; title: string }>;
  tag?: string;
  timestamp: string;
}

export interface RuntimeStateSnapshot {
  activeSessionMode?: string;
  activeSessionRemainingSeconds?: number;
  activeSessionStartedAt?: string;
  lastSuspendedAt?: string;
  lastResumedAt?: string;
  pendingRemindersCount: number;
  uptimeSeconds: number;
  autoStartEnabled: boolean;
}

export interface DaemonStatus {
  isRunning: boolean;
  uptimeSeconds: number;
  memoryUsageMB: number;
  cpuUsagePercent: number;
  services: ServiceHealth[];
  pendingJobsCount: number;
  lastReconciliationAt?: string;
}
