import { Message } from 'discord.js';
import { Analecta } from '../exp/analecta';
import { CommandProcessor } from '../abst/connector';

export const error: CommandProcessor = async (
  analecta: Analecta,
  msg: Message,
): Promise<boolean> => {
  if ((await msg.matchCommand(/^\/gh/)) == null) {
    return false;
  }

  msg.reply(analecta.ErrorMessage);
  return true;
};
