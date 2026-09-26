import { powerMonitor } from 'electron';
import { backgroundScheduler } from './scheduler';
import { notificationEngine } from './notification-engine';

export class PowerMonitorService {
  private lastSuspendedAt: number | null = null;
  private lastResumedAt: number | null = null;
  private reconciliationHistory: Array<{ suspendedAt: string; resumedAt: string; missedCount: number }> = [];

  constructor() {
    this.initListeners();
  }

  private initListeners(): void {
    if (!powerMonitor) return;

    // Detect system entering Sleep / Hibernate
    powerMonitor.on('suspend', () => {
      this.lastSuspendedAt = Date.now();
      console.log(`[PowerMonitor] System entering sleep/hibernate at: ${new Date(this.lastSuspendedAt).toISOString()}`);
    });

    // Detect system waking up
    powerMonitor.on('resume', () => {
      this.lastResumedAt = Date.now();
      console.log(`[PowerMonitor] System resumed from sleep/hibernate at: ${new Date(this.lastResumedAt).toISOString()}`);
      this.reconcileMissedEvents();
    });

    // Screen lock/unlock events
    powerMonitor.on('lock-screen', () => {
      console.log('[PowerMonitor] Screen locked');
    });

    powerMonitor.on('unlock-screen', () => {
      console.log('[PowerMonitor] Screen unlocked');
    });
  }

  public reconcileMissedEvents(): void {
    if (!this.lastSuspendedAt || !this.lastResumedAt) return;

    const suspendedDurationMinutes = Math.round((this.lastResumedAt - this.lastSuspendedAt) / 60000);
    console.log(`[PowerMonitor] Reconciling events after ${suspendedDurationMinutes} minutes of system sleep...`);

    // Audit scheduler queue for events that were due while sleeping
    const pending = backgroundScheduler.getPendingJobs();
    const missed = pending.filter((j) => j.targetTimestamp <= (this.lastResumedAt || Date.now()));

    if (missed.length > 0) {
      console.log(`[PowerMonitor] Found ${missed.length} missed schedules during sleep. Dispatching summary...`);

      notificationEngine.notify({
        id: `reconcile_${Date.now()}`,
        title: 'Personal OS • System Wakeup',
        body: `System was asleep for ${suspendedDurationMinutes}m. You have ${missed.length} pending alert(s) ready for review.`,
        urgency: 'normal',
        sound: true,
        timestamp: new Date().toISOString(),
      });
    }

    this.reconciliationHistory.push({
      suspendedAt: new Date(this.lastSuspendedAt).toISOString(),
      resumedAt: new Date(this.lastResumedAt).toISOString(),
      missedCount: missed.length,
    });
  }

  public getLastSuspendedAt(): number | null {
    return this.lastSuspendedAt;
  }

  public getLastResumedAt(): number | null {
    return this.lastResumedAt;
  }

  public getHistory() {
    return [...this.reconciliationHistory];
  }
}

export const powerMonitorService = new PowerMonitorService();
