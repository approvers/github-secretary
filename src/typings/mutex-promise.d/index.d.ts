declare module "mutex-promise" {
  export default class MutexPromise {
    constructor(key: string, options?: { timeout?: number; interval?: number });
    locked(): boolean;
    time(): number;

    lock(): void;
    unlock(): void;
    promise(): Promise<MutexPromise>;

    static interval: number;
    static timeout: number;
  }
}
