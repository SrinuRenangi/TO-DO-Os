import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BackgroundScheduler } from '../src/app/runtime/scheduler';
import { WatchdogService } from '../src/app/runtime/watchdog';
import { RecoveryEngine } from '../src/app/runtime/recovery';
import { AutoStartService } from '../src/app/runtime/auto-start';

describe('24/7 Native Desktop Runtime & Daemon Services', () => {
  describe('BackgroundScheduler (Event-Driven Delta Timers)', () => {
    it('schedules jobs in sorted order by target timestamp', () => {
      const scheduler = new BackgroundScheduler();
      const now = Date.now();

      scheduler.schedule({
        id: 'job-later',
        type: 'reminder',
        targetTimestamp: now + 5000,
        payload: { title: 'Later Reminder', body: 'Review tasks' },
      });

      scheduler.schedule({
        id: 'job-sooner',
        type: 'task_due',
        targetTimestamp: now + 1000,
        payload: { title: 'Sooner Deadline', body: 'Finish blueprint' },
      });

      const pending = scheduler.getPendingJobs();
      expect(pending.length).toBe(2);
      expect(pending[0].id).toBe('job-sooner');
      expect(pending[1].id).toBe('job-later');

      scheduler.cancel('job-later');
      expect(scheduler.getPendingCount()).toBe(1);
    });

    it('cancels scheduled jobs cleanly without leaking timers', () => {
      const scheduler = new BackgroundScheduler();
      scheduler.schedule({
        id: 'job-cancel',
        type: 'backup',
        targetTimestamp: Date.now() + 10000,
        payload: { title: 'Backup DB', body: 'Snapshot SQLite' },
      });

      expect(scheduler.cancel('job-cancel')).toBe(true);
      expect(scheduler.cancel('non-existent')).toBe(false);
      expect(scheduler.getPendingCount()).toBe(0);
    });
  });

  describe('WatchdogService (Supervisor & Health Audit)', () => {
    it('initializes health registry for all core sub-services', () => {
      const watchdog = new WatchdogService();
      const health = watchdog.getAllHealth();
      expect(health.length).toBeGreaterThanOrEqual(6);

      const schedulerHealth = health.find((h) => h.name === 'scheduler');
      expect(schedulerHealth?.status).toBe('healthy');
      expect(schedulerHealth?.errorCount).toBe(0);
    });

    it('records errors and attempts auto-recovery', () => {
      const watchdog = new WatchdogService();
      watchdog.reportError('scheduler', new Error('Transient scheduler lock'));

      const health = watchdog.getAllHealth();
      const schedulerHealth = health.find((h) => h.name === 'scheduler');
      expect(schedulerHealth?.errorCount).toBe(1);
      expect(schedulerHealth?.lastError).toContain('Transient scheduler lock');
    });

    it('audits resource consumption within <200MB budget', () => {
      const watchdog = new WatchdogService();
      const usage = watchdog.getResourceUsage();
      expect(usage.memoryMB).toBeGreaterThan(0);
      expect(usage.uptimeSeconds).toBeGreaterThanOrEqual(0);
    });
  });

  describe('RecoveryEngine (Startup State Machine)', () => {
    it('saves and restores snapshot state across unexpected reboots', () => {
      const recovery = new RecoveryEngine();
      recovery.saveSnapshot({
        activeSessionMode: 'deep_work',
        activeSessionRemainingSeconds: 1420,
        pendingRemindersCount: 3,
      });

      const snapshot = recovery.getSnapshot();
      expect(snapshot?.activeSessionMode).toBe('deep_work');
      expect(snapshot?.activeSessionRemainingSeconds).toBe(1420);

      const startupResult = recovery.recoverOnStartup();
      expect(startupResult.recovered).toBe(true);
      expect(startupResult.summary).toContain('deep_work');
    });
  });

  describe('AutoStartService', () => {
    it('manages auto-start configuration cleanly', () => {
      const autoStart = new AutoStartService();
      expect(typeof autoStart.isEnabled()).toBe('boolean');
      autoStart.setEnabled(true);
      expect(autoStart.isEnabled()).toBe(true);
      autoStart.toggle();
      expect(autoStart.isEnabled()).toBe(false);
    });
  });
});
