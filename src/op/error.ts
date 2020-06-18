import { Analecta } from '../exp/analecta.ts';
import { CommandProcessor } from '../abst/connector.ts';
import { Message } from '../abst/message.ts';

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
