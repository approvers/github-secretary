import { Message } from 'discord.js';
import { Analecta } from '../../exp/analecta';
import { CommandProcessor } from '../../abst/connector';
import { DiscordId, GitHubUser } from '../../exp/github-user';
import { fetchErrorHandler } from 'src/exp/fetch-error-handler';

export type UserDatabase = {
  register: (id: DiscordId, user: GitHubUser) => Promise<void>;
};

export type Query = {
  checkNotificationToken(userName: string, token: string): Promise<boolean>;
};

const subscribePattern = /^\/ghs ([^/:?]+) ([^/:?]+)/;

export const subscribeNotification = (db: UserDatabase, query: Query): CommandProcessor => async (
  analecta: Analecta,
  msg: Message,
): Promise<boolean> => {
  const matches = subscribePattern.exec(msg.content);
  if (matches == null || matches[1] == null || matches[2] == null) {
    return false;
  }

  await query
    .checkNotificationToken(matches[1], matches[2])
    .then((isValidToken) => {
      if (!isValidToken) {
        throw new Error('invalid token');
      }
    })
    .catch(
      fetchErrorHandler(async (mes) => {
        await msg.reply(mes);
      }),
    );

  await db.register(msg.author.id, {
    userName: matches[1],
    notificationToken: matches[2],
    currentNotificationIds: [],
  });

  await msg.reply(analecta.Subscribe);
  return true;
};
