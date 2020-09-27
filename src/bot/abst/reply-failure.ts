import { Analecta } from "../exp/analecta";
import { Message } from "./message";
import { choice } from "../exp/choice";

export const replyFailure = async (
  analecta: Analecta,
  msg: Message,
): Promise<boolean> => {
  const mes = choice(analecta.Failure);
  await msg.reply(mes);
  return true;
};
