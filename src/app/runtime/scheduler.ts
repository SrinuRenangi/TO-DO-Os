import { ScheduledJob } from './types';
import { notificationEngine } from './notification-engine';

export class BackgroundScheduler {
  private queue: ScheduledJob[] = [];
  private activeTimer: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private executionCount: number = 0;

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('[Scheduler] Background precision scheduler active (event-driven)');
    this.rearmTimer();
  }

  public stop(): void {
    this.isRunning = false;
    if (this.activeTimer) {
      clearTimeout(this.activeTimer);
      this.activeTimer = null;
    }
  }

  public schedule(job: ScheduledJob): void {
    // Insert into sorted queue (ascending order of targetTimestamp)
    this.queue.push(job);
    this.queue.sort((a, b) => a.targetTimestamp - b.targetTimestamp);

    // If this newly scheduled job is now the earliest, rearm timer immediately
    if (this.queue[0]?.id === job.id) {
      this.rearmTimer();
    }
  }

  public cancel(jobId: string): boolean {
    const initialLen = this.queue.length;
    this.queue = this.queue.filter((j) => j.id !== jobId);
    if (this.queue.length !== initialLen) {
      this.rearmTimer();
      return true;
    }
    return false;
  }

  public getPendingJobs(): ScheduledJob[] {
    return [...this.queue];
  }

  public getPendingCount(): number {
    return this.queue.length;
  }

  public getExecutionCount(): number {
    return this.executionCount;
  }

  private rearmTimer(): void {
    if (!this.isRunning) return;

    if (this.activeTimer) {
      clearTimeout(this.activeTimer);
      this.activeTimer = null;
    }

    if (this.queue.length === 0) {
      return; // Sleep until new job added
    }

    const nextJob = this.queue[0];
    const now = Date.now();
    const delay = Math.max(0, nextJob.targetTimestamp - now);

    // Max 32-bit integer timeout in Node.js (approx 24.8 days)
    const safeDelay = Math.min(delay, 2147483647);

    this.activeTimer = setTimeout(() => {
      this.executeDueJobs();
    }, safeDelay);
  }

  private executeDueJobs(): void {
    const now = Date.now();
    const dueJobs: ScheduledJob[] = [];
    const remainingJobs: ScheduledJob[] = [];

    for (const job of this.queue) {
      if (job.targetTimestamp <= now) {
        dueJobs.push(job);
      } else {
        remainingJobs.push(job);
      }
    }

    this.queue = remainingJobs;

    for (const job of dueJobs) {
      this.processJob(job);
      this.executionCount++;

      // If recurring, calculate next occurrence and re-insert
      if (job.payload.recurringPattern) {
        const nextOccurrence = this.calculateNextOccurrence(job.payload.recurringPattern);
        this.schedule({
          ...job,
          targetTimestamp: nextOccurrence,
        });
      }
    }

    // Rearm for next remaining job
    this.rearmTimer();
  }

  private processJob(job: ScheduledJob): void {
    console.log(`[Scheduler] Firing ${job.type} job: "${job.payload.title}"`);

    notificationEngine.notify({
      id: `notif_${job.id}_${Date.now()}`,
      title: job.payload.title,
      body: job.payload.body,
      urgency: job.payload.priority === 'urgent' ? 'critical' : 'normal',
      sound: true,
      timestamp: new Date().toISOString(),
      tag: job.type,
    });
  }

  private calculateNextOccurrence(pattern: 'daily' | 'weekdays' | 'weekly' | 'hourly'): number {
    const now = new Date();
    if (pattern === 'hourly') {
      return now.getTime() + 60 * 60 * 1000;
    }
    if (pattern === 'daily') {
      return now.getTime() + 24 * 60 * 60 * 1000;
    }
    if (pattern === 'weekdays') {
      const day = now.getDay();
      const daysToAdd = day === 5 ? 3 : day === 6 ? 2 : 1; // Skip weekends
      return now.getTime() + daysToAdd * 24 * 60 * 60 * 1000;
    }
    if (pattern === 'weekly') {
      return now.getTime() + 7 * 24 * 60 * 60 * 1000;
    }
    return now.getTime() + 24 * 60 * 60 * 1000;
  }
}

export const backgroundScheduler = new BackgroundScheduler();
