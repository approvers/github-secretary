import type { Analecta } from "../exp/analecta";
import type { CommandProcessor } from "../abst/connector";
import type { Message } from "../abst/message";

export const error: CommandProcessor = async (
  analecta: Analecta,
  msg: Message,
): Promise<boolean> => {
  if ((await msg.matchCommand(/^\/gh/u)) === null) {
    return false;
  }

  await msg.reply(analecta.ErrorMessage);
  return true;
};
