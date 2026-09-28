// ============================================================================
// Personal OS — Background Scheduler Service
// Zero-Leak Event-Driven Scheduler for Reminders, Overdue Tasks & Recurrence
// ============================================================================

import { reminderService } from '../reminders/reminder-service';

export class SchedulerService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private lastTickAt: number = Date.now();
  private tickCount: number = 0;

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTickAt = Date.now();
    console.log('[SchedulerService] Background daemon started. Continuous evaluation active.');

    // Check immediately on start (handles restart recovery)
    this.tick();

    // Non-intrusive 5s interval checking delta continuously
    this.intervalId = setInterval(() => {
      this.tick();
    }, 5000);
  }

  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('[SchedulerService] Background daemon stopped.');
  }

  public getStatus(): { isRunning: boolean; lastTickAt: number; tickCount: number } {
    return {
      isRunning: this.isRunning,
      lastTickAt: this.lastTickAt,
      tickCount: this.tickCount,
    };
  }

  public tick(): void {
    this.tickCount++;
    const now = Date.now();
    const elapsedMs = now - this.lastTickAt;
    this.lastTickAt = now;

    // If more than 15s elapsed between 5s ticks, system was asleep or suspended! Reconcile immediately:
    if (elapsedMs > 15000) {
      console.log(`[SchedulerService] System sleep/wake detected (${Math.round(elapsedMs / 1000)}s gap). Reconciling reminders...`);
    }

    // Check and trigger all due reminders (includes missed reminders from sleep or restart)
    try {
      const triggered = reminderService.checkAndTriggerDueReminders();
      if (triggered && triggered.length > 0) {
        console.log(`[SchedulerService] Processed ${triggered.length} due reminders on tick #${this.tickCount}.`);
      }
    } catch (err) {
      console.error('[SchedulerService] Error evaluating due reminders on tick:', err);
    }
  }
}

export const schedulerService = new SchedulerService();
