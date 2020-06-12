import { MessageEmbed } from 'discord.js';

import { CommandProcessor } from 'src/abst/connector';
import { Analecta } from 'src/exp/analecta';
import { GitHubUser, DiscordId } from 'src/exp/github-user';
import { replyFailure } from '../reply-failure';
import { fetchErrorHandler } from '../../exp/fetch-error-handler';
import { Message } from '../../abst/message';

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
  const matches = await msg.matchCommand(markPattern);
  if (matches == null) {
    return false;
  }
  const notificationIdToMarkAsRead = matches[1];

  return msg
    .withTyping(async () => {
      const user = await db.fetchUser(msg.getAuthorId());
      if (user == null) {
        await msg.reply(analecta.NotSubscribed);
        return true;
      }

      const { currentNotificationIds } = user;
      if (!currentNotificationIds.includes(notificationIdToMarkAsRead)) {
        return replyFailure(analecta, msg);
      }

      const res = await query.markAsRead(user, notificationIdToMarkAsRead);
      if (!res) {
        return replyFailure(analecta, msg);
      }

      await msg.sendEmbed(
        new MessageEmbed().setTitle(analecta.MarkAsRead).setURL(`https://github.com/notifications`),
      );
      return true;
    })
    .catch(
      fetchErrorHandler(async (embed) => {
        await msg.sendEmbed(embed);
      }),
    );
};
