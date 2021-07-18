import type { Analecta } from "../exp/analecta";
import type { CommandProcessor } from "../abst/connector";
import type { Message } from "../abst/message";
import { choice } from "../exp/choice";

export const flavor =
  (callPattern: RegExp, blackPattern: RegExp): CommandProcessor =>
  async (analecta: Analecta, msg: Message): Promise<boolean> => {
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
