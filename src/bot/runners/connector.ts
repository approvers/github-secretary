export interface CommandProcessor<T> {
  (args: T): Promise<boolean>;
}

const connectBin =
  <T>(
    left: CommandProcessor<T>,
    right: CommandProcessor<T>,
  ): CommandProcessor<T> =>
  async (arg: T): Promise<boolean> =>
    (await left(arg)) || right(arg);

export const connectProcessors = <T>(
  procs: CommandProcessor<T>[],
): CommandProcessor<T> =>
  procs.reduce(connectBin, () => Promise.resolve(false));
