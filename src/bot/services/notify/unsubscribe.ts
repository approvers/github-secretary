import type { Analecta } from "../../model/analecta";
import type { CommandProcessor } from "../../runners/connector";
import type { Message } from "../../model/message";
import type { UserDatabase } from "./user-database";

const unsubscribePattern = /^\/ghu(?: .*)?/u;

export const unsubNotification =
  (db: UserDatabase, analecta: Analecta): CommandProcessor<Message> =>
  async (msg: Message): Promise<boolean> => {
    if (!(await msg.matchCommand(unsubscribePattern))) {
      return false;
    }

    const suceed = await db.unregister(msg.getAuthorId());
    if (!suceed) {
      await msg.reply(analecta.NotSubscribed);
      return true;
    }

    await msg.reply(analecta.Unsubscribe);
    return true;
  };
