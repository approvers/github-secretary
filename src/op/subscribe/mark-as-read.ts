import fetch from 'node-fetch';
import { Message, MessageEmbed } from 'discord.js';

import { CommandProcessor } from 'src/abst/connector';
import { Analecta } from 'src/exp/analecta';
import { GitHubUser, DiscordId } from 'src/exp/github-user';
import { replyFailure } from '../reply-failure';
import { fetchErrorHandler } from '../../exp/fetch-error-handler';

export type UserDatabase = {
  fetchUser(discordId: DiscordId): Promise<GitHubUser | undefined>;
};

const markPattern = /^\/ghm ([0-9]+)$/;

export const markAsRead = (db: UserDatabase): CommandProcessor => async (
  analecta: Analecta,
  msg: Message,
): Promise<boolean> => {
  const matches = markPattern.exec(msg.content);
  if (matches == null) {
    return false;
  }
  const notificationIdToMarkAsRead = matches[1];

  await msg.channel.startTyping();

  const user = await db.fetchUser(msg.author.id).catch(
    fetchErrorHandler(async (embed) => {
      await msg.reply(embed);
    }),
  );
  if (user == null) {
    msg.channel.stopTyping(true);
    await msg.reply(analecta.NotSubscribed);
    return true;
  }
  const { userName, notificationToken, currentNotificationIds } = user;
  if (!currentNotificationIds.includes(notificationIdToMarkAsRead)) {
    msg.channel.stopTyping(true);
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
  ).catch(
    fetchErrorHandler(async (embed) => {
      await msg.reply(embed);
    }),
  );
  msg.channel.stopTyping();
  if (res.status !== 205) {
    return replyFailure(analecta, msg);
  }

  await msg.reply(
    new MessageEmbed().setTitle(analecta.MarkAsRead).setURL(`https://github.com/notifications`),
  );
  return true;
};
