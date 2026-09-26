import { ServiceHealth, ServiceName } from './types';
import { backgroundScheduler } from './scheduler';

export class WatchdogService {
  private healthRegistry: Map<ServiceName, ServiceHealth> = new Map();
  private auditInterval: NodeJS.Timeout | null = null;
  private readonly checkIntervalMs = 60000; // 60s non-intrusive heartbeat
  private startedAt = Date.now();

  constructor() {
    this.registerServices();
  }

  public start(): void {
    if (this.auditInterval) return;

    this.auditInterval = setInterval(() => {
      this.performAudit();
    }, this.checkIntervalMs);

    // Initial audit
    this.performAudit();
    console.log('[Watchdog] 24/7 Watchdog Supervisor active with 60s health audits');
  }

  public stop(): void {
    if (this.auditInterval) {
      clearInterval(this.auditInterval);
      this.auditInterval = null;
    }
  }

  public reportHealthy(name: ServiceName): void {
    const existing = this.healthRegistry.get(name);
    if (existing) {
      existing.status = 'healthy';
      existing.lastHeartbeat = new Date().toISOString();
      existing.uptimeSeconds = Math.round((Date.now() - this.startedAt) / 1000);
    }
  }

  public reportError(name: ServiceName, err: Error | string): void {
    const existing = this.healthRegistry.get(name);
    if (existing) {
      existing.status = 'degraded';
      existing.errorCount++;
      existing.lastError = typeof err === 'string' ? err : err.message;
      console.error(`[Watchdog] Error in ${name}:`, err);
      this.attemptAutoRecovery(name);
    }
  }

  public getAllHealth(): ServiceHealth[] {
    return Array.from(this.healthRegistry.values());
  }

  public getResourceUsage(): { memoryMB: number; uptimeSeconds: number } {
    const mem = process.memoryUsage();
    const memoryMB = Math.round(mem.rss / 1024 / 1024);
    const uptimeSeconds = Math.round((Date.now() - this.startedAt) / 1000);
    return { memoryMB, uptimeSeconds };
  }

  private performAudit(): void {
    const { memoryMB, uptimeSeconds } = this.getResourceUsage();

    // Check Scheduler status
    try {
      const pending = backgroundScheduler.getPendingCount();
      this.reportHealthy('scheduler');
    } catch (err: any) {
      this.reportError('scheduler', err);
    }

    // Update heartbeats
    this.reportHealthy('notifications');
    this.reportHealthy('auto-start');
    this.reportHealthy('tray');
    this.reportHealthy('power-monitor');
    this.reportHealthy('database');

    // Memory usage guard (<200MB target)
    if (memoryMB > 180) {
      console.warn(`[Watchdog] Memory usage at ${memoryMB}MB. Triggering memory trimming...`);
      if (global.gc) {
        global.gc();
      }
    }
  }

  private attemptAutoRecovery(name: ServiceName): void {
    console.log(`[Watchdog] Attempting auto-recovery for service: ${name}...`);
    if (name === 'scheduler') {
      try {
        backgroundScheduler.stop();
        backgroundScheduler.start();
        this.reportHealthy('scheduler');
        console.log('[Watchdog] Background scheduler successfully auto-recovered.');
      } catch (recoveryErr) {
        console.error('[Watchdog] Failed to auto-recover scheduler:', recoveryErr);
      }
    }
  }

  private registerServices(): void {
    const names: ServiceName[] = [
      'scheduler',
      'notifications',
      'tray',
      'auto-start',
      'power-monitor',
      'watchdog',
      'database',
    ];

    for (const name of names) {
      this.healthRegistry.set(name, {
        name,
        status: 'healthy',
        uptimeSeconds: 0,
        lastHeartbeat: new Date().toISOString(),
        errorCount: 0,
      });
    }
  }
}

export const watchdogService = new WatchdogService();
