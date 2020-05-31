import { DiscordId, GitHubUser } from '../exp/github-user';
import { Message } from 'discord.js';
import { Analecta } from '../exp/analecta';
import { CommandProcessor } from '../abst/connector';
import fetch from 'node-fetch';
import { SubscriptionNotifier } from 'src/exp/notify';

export type UserDatabase = {
  register: (id: DiscordId, user: GitHubUser) => Promise<void>;
};

const subscribePattern = /^\/ghs ([^/:?]+)\/([^/:?]+)/;

export const subscribeNotification = (
  db: UserDatabase,
  notifier: SubscriptionNotifier,
): CommandProcessor => async (analecta: Analecta, msg: Message): Promise<boolean> => {
  if (!subscribePattern.test(msg.content)) {
    return false;
  }

  const matches = msg.content.match(subscribePattern);
  if (matches == null || matches[1] == null || matches[2] == null) {
    return false;
  }

  const res = await fetch(`https://api.github.com/notifications`, {
    headers: {
      Authorization: `Basic ` + Buffer.from(`${matches[1]}:${matches[2]}`).toString('base64'),
    },
  });
  if (!res.ok) {
    msg.reply(analecta.InvalidToken);
    return true;
  }

  await db.register(msg.author.id, {
    userName: matches[1],
    notificationToken: matches[2],
    currentNotificationIds: [],
  });
  await notifier.update();

  msg.reply(analecta.Subscribe);
  return true;
};
