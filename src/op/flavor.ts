import { Analecta } from '../exp/analecta';
import { CommandProcessor } from '../abst/connector';
import { Message } from '../abst/message';

export const flavor = (callPattern: RegExp, blackPattern: RegExp): CommandProcessor => async (
  analecta: Analecta,
  msg: Message,
): Promise<boolean> => {
  if (!msg.matchPlainText(callPattern) || msg.matchPlainText(blackPattern)) {
    return false;
  }

  const mes = [...analecta.Flavor].sort(() => Math.random() - 0.5)[0];
  msg.reply(mes);
  return true;
};
