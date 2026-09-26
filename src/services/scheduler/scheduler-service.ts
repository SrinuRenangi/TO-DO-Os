// ============================================================================
// Personal OS — Background Scheduler Service
// Zero-Leak Event-Driven Scheduler for Reminders, Overdue Tasks & Recurrence
// ============================================================================

import { reminderService } from '../reminders/reminder-service';

export class SchedulerService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private lastTickAt: number = Date.now();

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTickAt = Date.now();

    // Check immediately on start
    this.tick();

    // Non-intrusive 5s interval checking delta
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
  }

  public tick(): void {
    const now = Date.now();
    const elapsedMs = now - this.lastTickAt;
    this.lastTickAt = now;

    // If more than 30s elapsed between ticks, system was asleep or suspended! Reconcile immediately:
    if (elapsedMs > 30000) {
      console.log(`[SchedulerService] System sleep/wake detected (${Math.round(elapsedMs / 1000)}s gap). Reconciling reminders...`);
    }

    // Check and trigger all due reminders
    reminderService.checkAndTriggerDueReminders();
  }
}

export const schedulerService = new SchedulerService();
