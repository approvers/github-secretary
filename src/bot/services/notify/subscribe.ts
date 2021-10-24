import type { Analecta } from "../../model/analecta";
import type { CommandProcessor } from "../../runners/connector";
import type { Message } from "../../model/message";
import type { UserApi } from "src/bot/services/command/api";
import type { UserDatabase } from "./user-database";

const subscribePattern = /^\/ghs (?<name>[^/:?]+) (?<token>[^/:?]+)\s*$/u;

export const subscribeNotification =
  (
    db: UserDatabase,
    query: UserApi,
    analecta: Analecta,
  ): CommandProcessor<Message> =>
  async (msg: Message): Promise<boolean> => {
    const matches = await msg.matchCommand(subscribePattern);
    if (matches === null || !matches.groups) {
      return false;
    }
    const { name, token } = matches.groups;
    if (!name || !token) {
      return false;
    }

    const user = await query.getGitHubUser(name, token).catch(msg.panic);

    await db.register(msg.getAuthorId(), user);

    await msg.reply(analecta.Subscribe);
    return true;
  };
