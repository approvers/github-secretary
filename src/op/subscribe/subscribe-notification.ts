import { Analecta } from "../../exp/analecta";
import { CommandProcessor } from "../../abst/connector";
import { GitHubUser } from "../../exp/github-user";
import { DiscordId } from "../../exp/discord-id";
import { fetchErrorHandler } from "../../skin/fetch-error-handler";
import { Message } from "../../abst/message";

export type UserDatabase = {
  register: (id: DiscordId, user: GitHubUser) => Promise<void>;
};

export type Query = {
  getGitHubUser(userName: string, token: string): Promise<GitHubUser>;
};

const subscribePattern = /^\/ghs ([^/:?]+) ([^/:?]+)/;

export const subscribeNotification = (
  db: UserDatabase,
  query: Query
): CommandProcessor => async (
  analecta: Analecta,
  msg: Message
): Promise<boolean> => {
  const matches = await msg.matchCommand(subscribePattern);
  if (matches == null || matches[1] == null || matches[2] == null) {
    return false;
  }

  const user = await query.getGitHubUser(matches[1], matches[2]).catch(
    fetchErrorHandler(async (mes) => {
      await msg.sendEmbed(mes);
    })
  );

  await db.register(msg.getAuthorId(), user);

  await msg.reply(analecta.Subscribe);
  return true;
};
