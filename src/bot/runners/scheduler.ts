export interface ScheduledTask {
  run(): Promise<number | null>;
}

export class Scheduler {
  start(task: ScheduledTask, timeout: number): void {
    setTimeout(async () => {
      const newTimeout = await task.run();
      this.onDidRun(task, newTimeout);
    }, timeout);
  }

  private onDidRun(task: ScheduledTask, timeout: number | null): void {
    if (timeout !== null) {
      this.start(task, timeout);
    }
  }
}
