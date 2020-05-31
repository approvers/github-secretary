import { Message } from 'discord.js';
import { Analecta } from '../exp/analecta';
import { CommandProcessor } from '../abst/connector';

export const flavor = (callPattern: RegExp, blackPattern: RegExp): CommandProcessor => async (
  analecta: Analecta,
  msg: Message,
): Promise<boolean> => {
  if (!callPattern.test(msg.content) || blackPattern.test(msg.content)) {
    return false;
  }

  const mes = [...analecta.Flavor].sort(() => Math.random() - 0.5)[0];
  msg.reply(mes);
  return true;
};
