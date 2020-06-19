import { Analecta } from "../../exp/analecta.ts";
import { CommandProcessor } from "../../abst/connector.ts";
import { GitHubUser } from "../../exp/github-user.ts";
import { DiscordId } from "../../exp/discord-id.ts";
import { fetchErrorHandler } from "../../skin/fetch-error-handler.ts";
import { Message } from "../../abst/message.ts";

export type UserDatabase = {
  register: (id: DiscordId, user: GitHubUser) => Promise<void>;
};

export type Query = {
  getGitHubUser(userName: string, token: string): Promise<GitHubUser>;
};

const subscribePattern = /^\/ghs ([^/:?]+) ([^/:?]+)/;

export const subscribeNotification = (
  db: UserDatabase,
  query: Query,
): CommandProcessor =>
  async (
    analecta: Analecta,
    msg: Message,
  ): Promise<boolean> => {
    const matches = await msg.matchCommand(subscribePattern);
    if (matches == null || matches[1] == null || matches[2] == null) {
      return false;
    }

    const user = await query.getGitHubUser(matches[1], matches[2]).catch(
      fetchErrorHandler(async (mes) => {
        await msg.sendEmbed(mes);
      }),
    );

    await db.register(msg.getAuthorId(), user);

    await msg.reply(analecta.Subscribe);
    return true;
  };
