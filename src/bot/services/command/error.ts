import type { Analecta } from "../../model/analecta.js";
import type { CommandProcessor } from "../../runners/connector.js";
import type { Message } from "../../model/message.js";

export const error =
  (analecta: Analecta): CommandProcessor<Message> =>
  async (msg: Message) => {
    if ((await msg.matchCommand(/^\/gh/u)) === null) {
      return false;
    }

    await msg.reply(analecta.ErrorMessage);
    return true;
  };
