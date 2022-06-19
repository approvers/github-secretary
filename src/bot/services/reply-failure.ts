import type { Analecta } from "../model/analecta.js";
import { CommandProcessor } from "../runners/connector.js";
import type { Message } from "../model/message.js";
import { choice } from "../model/choice.js";

export const replyFailure =
  (analecta: Analecta): CommandProcessor<Message> =>
  async (msg: Message) => {
    const mes = choice(analecta.Failure);
    await msg.reply(mes);
    return true;
  };
