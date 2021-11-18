import type { Analecta } from "src/bot/model/analecta";
import type { CommandProcessor } from "src/bot/runners/connector";
import type { Message } from "../../model/message";
import { choice } from "../../model/choice";

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
