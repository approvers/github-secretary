import { Analecta } from '../../exp/analecta';
import { CommandProcessor } from '../../abst/connector';
import { DiscordId, GitHubUser } from '../../exp/github-user';
import { fetchErrorHandler } from '../../exp/fetch-error-handler';
import { Message } from '../../abst/message';

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
  const matches = await msg.matchCommand(subscribePattern);
  if (matches == null || matches[1] == null || matches[2] == null) {
    return false;
  }

  const isValidToken = await query.checkNotificationToken(matches[1], matches[2]).catch(
    fetchErrorHandler(async (mes) => {
      await msg.sendEmbed(mes);
    }),
  );
  if (!isValidToken) {
    throw new Error('invalid token');
  }

  await db.register(msg.getAuthorId(), {
    userName: matches[1],
    notificationToken: matches[2],
    currentNotificationIds: [],
  });

  await msg.reply(analecta.Subscribe);
  return true;
};
