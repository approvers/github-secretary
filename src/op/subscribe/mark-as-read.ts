import { Message, MessageEmbed } from 'discord.js';

import { CommandProcessor } from 'src/abst/connector';
import { Analecta } from 'src/exp/analecta';
import { GitHubUser, DiscordId } from 'src/exp/github-user';
import { replyFailure } from '../reply-failure';
import { fetchErrorHandler } from '../../exp/fetch-error-handler';

export type UserDatabase = {
  fetchUser(discordId: DiscordId): Promise<GitHubUser | undefined>;
};

export type Query = {
  markAsRead(user: GitHubUser, notificationIdToMarkAsRead: string): Promise<boolean>;
};

const markPattern = /^\/ghm ([0-9]+)$/;

export const markAsRead = (db: UserDatabase, query: Query): CommandProcessor => async (
  analecta: Analecta,
  msg: Message,
): Promise<boolean> => {
  const matches = markPattern.exec(msg.content);
  if (matches == null) {
    return false;
  }
  const notificationIdToMarkAsRead = matches[1];

  msg.channel.stopTyping(true);
  await msg.channel.startTyping();

  const user = await db.fetchUser(msg.author.id).catch(
    fetchErrorHandler(async (embed) => {
      msg.channel.stopTyping(true);
      await msg.reply(embed);
    }),
  );
  if (user == null) {
    msg.channel.stopTyping(true);
    await msg.reply(analecta.NotSubscribed);
    return true;
  }
  const { currentNotificationIds } = user;
  if (!currentNotificationIds.includes(notificationIdToMarkAsRead)) {
    msg.channel.stopTyping(true);
    return replyFailure(analecta, msg);
  }

  const res = await query.markAsRead(user, notificationIdToMarkAsRead).catch(
    fetchErrorHandler(async (embed) => {
      msg.channel.stopTyping(true);
      await msg.reply(embed);
    }),
  );
  msg.channel.stopTyping();
  if (!res) {
    return replyFailure(analecta, msg);
  }

  await msg.reply(
    new MessageEmbed().setTitle(analecta.MarkAsRead).setURL(`https://github.com/notifications`),
  );
  return true;
};
