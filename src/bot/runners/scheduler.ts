export interface ScheduledTask {
  (): Promise<number | null>;
}

export class Scheduler {
  private runningTasks = new Map<string, NodeJS.Timeout>();

  start(key: string, task: ScheduledTask): void {
    this.startInner(key, task, 0);
  }

  stop(key: string): void {
    this.runningTasks.delete(key);
  }

  private startInner(key: string, task: ScheduledTask, timeout: number): void {
    const id = setTimeout(async () => {
      const newTimeout = await task();
      this.onDidRun(key, task, newTimeout);
    }, timeout);
    this.runningTasks.set(key, id);
  }

  private onDidRun(
    key: string,
    task: ScheduledTask,
    timeout: number | null,
  ): void {
    if (timeout === null) {
      this.runningTasks.delete(key);
    } else {
      this.startInner(key, task, timeout);
    }
  }
}
