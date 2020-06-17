import { Message } from 'discord.js';

import { Analecta } from '../../exp/analecta';
import { CommandProcessor } from '../../abst/connector';
import { DiscordId, GitHubUser } from '../../exp/github-user';
import { fetchErrorHandler } from '../../exp/fetch-error-handler';

export type UserDatabase = {
  register: (id: DiscordId, user: GitHubUser) => Promise<void>;
};

export type Query = {
  getGitHubUser(userName: string, token: string): Promise<GitHubUser>;
};

const subscribePattern = /^\/ghs ([^/:?]+) ([^/:?]+)/;

export const subscribeNotification = (db: UserDatabase): CommandProcessor => async (
  analecta: Analecta,
  msg: Message,
): Promise<boolean> => {
  if (!subscribePattern.test(msg.content)) {
    return false;
  }

  const matches = msg.content.match(subscribePattern);
  if (matches == null || matches[1] == null || matches[2] == null) {
    return false;
  }

  const user = await query.getGitHubUser(matches[1], matches[2]).catch(
    fetchErrorHandler(async (mes) => {
      await msg.sendEmbed(mes);
    }),
  );

  await db.register(msg.getAuthorId(), user);

  msg.reply(analecta.Subscribe);
  return true;
};
