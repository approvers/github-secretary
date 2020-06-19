import { Analecta } from "../exp/analecta.ts";
import { CommandProcessor } from "../abst/connector.ts";
import { Message } from "../abst/message.ts";

export const flavor = (
  callPattern: RegExp,
  blackPattern: RegExp,
): CommandProcessor =>
  async (
    analecta: Analecta,
    msg: Message,
  ): Promise<boolean> => {
    if (
      !(await msg.matchPlainText(callPattern)) ||
      (await msg.matchPlainText(blackPattern))
    ) {
      return false;
    }

    const mes = [...analecta.Flavor].sort(() => Math.random() - 0.5)[0];
    await msg.reply(mes);
    return true;
  };
