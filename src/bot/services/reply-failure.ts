import type { Analecta } from "../model/analecta";
import { CommandProcessor } from "../runners/connector";
import type { Message } from "../model/message";
import { choice } from "../model/choice";

export const replyFailure =
  (analecta: Analecta): CommandProcessor<Message> =>
  async (msg: Message) => {
    const mes = choice(analecta.Failure);
    await msg.reply(mes);
    return true;
  };
