import type { Analecta } from "../../exp/analecta";
import type { CommandProcessor } from "../../abst/connector";
import type { Message } from "../../abst/message";
import type { UserDatabase } from "../../abst/user-database";

const unsubscribePattern = /^\/ghu(?: .*)?/u;

export const unsubNotification = (db: UserDatabase): CommandProcessor => async (
  analecta: Analecta,
  msg: Message,
): Promise<boolean> => {
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
