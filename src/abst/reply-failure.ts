import { Analecta } from '../exp/analecta.ts';
import { Message } from './message.ts';

export const replyFailure = async (analecta: Analecta, msg: Message): Promise<boolean> => {
  const mes = [...analecta.Failure].sort(() => Math.random() - 0.5)[0];
  msg.reply(mes);
  return true;
};
