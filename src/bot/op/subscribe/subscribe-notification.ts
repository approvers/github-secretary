import { Analecta } from "../../exp/analecta";
import { CommandProcessor } from "../../abst/connector";
import { DiscordId } from "../../exp/discord-id";
import { GitHubUser } from "../../exp/github-user";
import { Message } from "../../abst/message";
import { fetchErrorHandler } from "../../skin/fetch-error-handler";

export type UserDatabase = {
  register: (id: DiscordId, user: GitHubUser) => Promise<void>;
};

export type Query = {
  getGitHubUser(userName: string, token: string): Promise<GitHubUser>;
};

const subscribePattern = /^\/ghs (?<name>[^/:?]+) (?<token>[^/:?]+)\s*$/u;

export const subscribeNotification = (
  db: UserDatabase,
  query: Query,
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
