// ============================================================================
// Personal OS — Timer Service
// Wall-Clock Accurate Background Countdown, Pomodoro & Stopwatch Engine
// ============================================================================

import { databaseService } from '../database/database-service';
import { TimerEntity, TimerMode } from '../database/types';
import { notificationService } from '../notifications/notification-service';

export class TimerService {
  private timer: TimerEntity;
  private intervalId: NodeJS.Timeout | null = null;
  private subscribers: Array<(timer: TimerEntity) => void> = [];

  constructor() {
    this.timer = databaseService.getTimer();
    this.reconcileBackgroundElapsed();
  }

  public getTimer(): TimerEntity {
    return { ...this.timer };
  }

  public subscribe(cb: (timer: TimerEntity) => void): () => void {
    this.subscribers.push(cb);
    cb({ ...this.timer });
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== cb);
    };
  }

  public setMode(mode: TimerMode, customSeconds?: number): TimerEntity {
    this.pause();

    let targetSeconds = 25 * 60;
    if (mode === 'pomodoro') targetSeconds = 25 * 60;
    else if (mode === 'countdown') targetSeconds = customSeconds || 15 * 60;
    else if (mode === 'stopwatch') targetSeconds = 0;

    this.timer = {
      ...this.timer,
      mode,
      targetSeconds,
      remainingSeconds: targetSeconds,
      isRunning: false,
      lastStartedAt: undefined,
    };

    databaseService.saveTimer(this.timer);
    this.notifySubscribers();
    return this.timer;
  }

  public start(): void {
    if (this.timer.isRunning) return;

    this.timer = {
      ...this.timer,
      isRunning: true,
      lastStartedAt: Date.now(),
    };

    databaseService.saveTimer(this.timer);
    this.startInterval();
    this.notifySubscribers();
  }

  public pause(): void {
    if (!this.timer.isRunning) return;

    this.reconcileBackgroundElapsed();
    this.timer = {
      ...this.timer,
      isRunning: false,
      lastStartedAt: undefined,
    };

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    databaseService.saveTimer(this.timer);
    this.notifySubscribers();
  }

  public reset(): void {
    this.pause();
    this.timer = {
      ...this.timer,
      remainingSeconds: this.timer.targetSeconds,
      isRunning: false,
      lastStartedAt: undefined,
    };

    databaseService.saveTimer(this.timer);
    this.notifySubscribers();
  }

  private startInterval(): void {
    if (this.intervalId) clearInterval(this.intervalId);

    this.intervalId = setInterval(() => {
      if (!this.timer.isRunning) return;

      if (this.timer.mode === 'stopwatch') {
        this.timer.remainingSeconds += 1;
        this.notifySubscribers();
      } else {
        if (this.timer.remainingSeconds <= 1) {
          // Timer completed!
          this.timer.remainingSeconds = 0;
          this.pause();
          notificationService.dispatch({
            title: 'Personal OS: Focus Session Complete',
            body: `${this.timer.mode.toUpperCase()} session finished. Take a well-earned break.`,
            urgency: 'normal',
            sound: true,
          });
        } else {
          this.timer.remainingSeconds -= 1;
          this.notifySubscribers();
        }
      }
    }, 1000);
  }

  private reconcileBackgroundElapsed(): void {
    if (this.timer.isRunning && this.timer.lastStartedAt) {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - this.timer.lastStartedAt) / 1000);

      if (this.timer.mode === 'stopwatch') {
        this.timer.remainingSeconds += elapsedSeconds;
      } else {
        this.timer.remainingSeconds = Math.max(0, this.timer.remainingSeconds - elapsedSeconds);
      }
      this.timer.lastStartedAt = now;
    }
  }

  private notifySubscribers(): void {
    for (const sub of this.subscribers) {
      sub({ ...this.timer });
    }
  }
}

export const timerService = new TimerService();
