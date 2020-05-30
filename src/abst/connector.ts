import { Analecta } from '../exp/analecta';
import { Message } from 'discord.js';

export type CommandProcessor = (analaecta: Analecta, msg: Message) => Promise<boolean>;

const connectBin = (l: CommandProcessor, r: CommandProcessor): CommandProcessor => async (
  analaecta: Analecta,
  msg: Message,
): Promise<boolean> => (await l(analaecta, msg)) || (await r(analaecta, msg));

export const connectProcessors = (procs: CommandProcessor[]): CommandProcessor =>
  procs.reduce(connectBin, async () => false);
