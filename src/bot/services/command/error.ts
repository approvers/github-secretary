import type { Analecta } from "../../model/analecta";
import type { CommandProcessor } from "../../runners/connector";
import type { Message } from "../../model/message";

export const error =
  (analecta: Analecta): CommandProcessor<Message> =>
  async (msg: Message) => {
    if ((await msg.matchCommand(/^\/gh/u)) === null) {
      return false;
    }

    await msg.reply(analecta.ErrorMessage);
    return true;
  };
