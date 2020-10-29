import type { Analecta } from "../../exp/analecta";
import type { CommandProcessor } from "../../abst/connector";
import type { DiscordId } from "../../exp/discord-id";
import type { Message } from "../../abst/message";

export type UserDatabase = {
  unregister: (id: DiscordId) => Promise<boolean>;
};

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
