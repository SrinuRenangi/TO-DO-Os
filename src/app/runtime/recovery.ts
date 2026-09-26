import { RuntimeStateSnapshot } from './types';
import { autoStartService } from './auto-start';

export class RecoveryEngine {
  private lastSnapshot: RuntimeStateSnapshot | null = null;

  public saveSnapshot(snapshot: Partial<RuntimeStateSnapshot>): void {
    this.lastSnapshot = {
      pendingRemindersCount: snapshot.pendingRemindersCount || 0,
      uptimeSeconds: snapshot.uptimeSeconds || 0,
      autoStartEnabled: autoStartService.isEnabled(),
      ...snapshot,
    };
  }

  public recoverOnStartup(): { recovered: boolean; summary: string } {
    console.log('[RecoveryEngine] Executing startup state recovery inspection...');

    // Audit for uncommitted sessions
    if (this.lastSnapshot?.activeSessionMode) {
      const summary = `Recovered previous ${this.lastSnapshot.activeSessionMode} session.`;
      console.log(`[RecoveryEngine] ${summary}`);
      return { recovered: true, summary };
    }

    return { recovered: false, summary: 'Clean startup. All runtime services ready.' };
  }

  public getSnapshot(): RuntimeStateSnapshot | null {
    return this.lastSnapshot;
  }
}

export const recoveryEngine = new RecoveryEngine();
