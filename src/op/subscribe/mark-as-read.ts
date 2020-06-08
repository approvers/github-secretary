import fetch from 'node-fetch';
import { Message, MessageEmbed } from 'discord.js';

import { CommandProcessor } from 'src/abst/connector';
import { Analecta } from 'src/exp/analecta';
import { GitHubUser, DiscordId } from 'src/exp/github-user';
import { replyFailure } from '../reply-failure';

export type UserDatabase = {
  fetchUser(discordId: DiscordId): Promise<GitHubUser | undefined>;
};

const markPattern = /^\/ghm ([0-9]+)/;

export const markAsRead = (db: UserDatabase): CommandProcessor => async (
  analecta: Analecta,
  msg: Message,
): Promise<boolean> => {
  if (markPattern.test(msg.content)) {
    return false;
  }

  const matches = msg.content.match(markPattern);
  if (matches == null) {
    return false;
  }
  const notificationIdToMarkAsRead = matches[1];
  if (notificationIdToMarkAsRead == null) {
    return false;
  }

  await msg.channel.startTyping();

  const user = await db.fetchUser(msg.author.id);
  if (user == null) {
    await msg.channel.stopTyping();
    await msg.reply(analecta.NotSubscribed);
    return true;
  }
  const { userName, notificationToken, currentNotificationIds } = user;
  if (!currentNotificationIds.includes(notificationIdToMarkAsRead)) {
    await msg.channel.stopTyping();
    return replyFailure(analecta, msg);
  }

  const res = await fetch(
    `https://api.github.com/notifications/threads/${notificationIdToMarkAsRead}`,
    {
      method: 'PATCH',
      headers: {
        Authorization:
          `Basic ` + Buffer.from(`${userName}:${notificationToken}`).toString('base64'),
      },
    },
  );
  await msg.channel.stopTyping();
  if (res.status !== 205) {
    return replyFailure(analecta, msg);
  }

  await msg.reply(
    new MessageEmbed().setTitle(analecta.MarkAsRead).setURL(`https://github.com/notifications`),
  );
  return true;
};
