import type { Analecta } from "src/bot/model/analecta.js";
import type { CommandProcessor } from "src/bot/runners/connector.js";
import type { Message } from "../../model/message.js";
import { choice } from "../../model/choice.js";

export const flavor =
  (
    callPattern: RegExp,
    blackPattern: RegExp,
    analecta: Analecta,
  ): CommandProcessor<Message> =>
  async (msg: Message): Promise<boolean> => {
    if (
      !(await msg.matchPlainText(callPattern)) ||
      (await msg.matchPlainText(blackPattern))
    ) {
      return false;
    }

    const mes = choice(analecta.Flavor);
    await msg.reply(mes);
    return true;
  };
