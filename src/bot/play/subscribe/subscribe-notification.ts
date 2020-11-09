import type { Analecta } from "../../exp/analecta";
import type { CommandProcessor } from "../../abst/connector";
import type { Message } from "../../abst/message";
import type { UserApi } from "src/bot/abst/api";
import type { UserDatabase } from "../../abst/user-database";
import { fetchErrorHandler } from "../../skin/fetch-error-handler";

const subscribePattern = /^\/ghs (?<name>[^/:?]+) (?<token>[^/:?]+)\s*$/u;

export const subscribeNotification = (
  db: UserDatabase,
  query: UserApi,
): CommandProcessor => async (
  analecta: Analecta,
  msg: Message,
): Promise<boolean> => {
  const matches = await msg.matchCommand(subscribePattern);
  if (matches === null || !matches.groups) {
    return false;
  }
  const { name, token } = matches.groups;
  if (!name || !token) {
    return false;
  }

  const user = await query
    .getGitHubUser(name, token)
    .catch(fetchErrorHandler((mes) => msg.sendEmbed(mes)));

  await db.register(msg.getAuthorId(), user);

  await msg.reply(analecta.Subscribe);
  return true;
};
