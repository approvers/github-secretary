import { Analecta } from "../exp/analecta";
import { CommandProcessor } from "../abst/connector";
import { Message } from "../abst/message";

export const error: CommandProcessor = async (
  analecta: Analecta,
  msg: Message
): Promise<boolean> => {
  if ((await msg.matchCommand(/^\/gh/)) == null) {
    return false;
  }

  await msg.reply(analecta.ErrorMessage);
  return true;
};
