import { MessageEmbed } from 'discord.js';

import { CommandProcessor } from '../../abst/connector';
import { Analecta } from '../../exp/analecta';
import { GitHubUser } from '../../exp/github-user';
import { DiscordId } from '../../exp/discord-id';
import { replyFailure } from '../../abst/reply-failure';
import { fetchErrorHandler } from '../../skin/fetch-error-handler';
import { Message } from '../../abst/message';
import { includes, NotificationId } from '../../exp/notifications';

export type UserDatabase = {
  fetchUser(discordId: DiscordId): Promise<GitHubUser | undefined>;
};

export type Query = {
  markAsRead(user: GitHubUser, notificationIdToMarkAsRead: NotificationId): Promise<boolean>;
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
  const notificationIdToMarkAsRead = matches[1] as NotificationId;

  return msg
    .withTyping(async () => {
      const user = await db.fetchUser(msg.getAuthorId());
      if (user == null) {
        await msg.reply(analecta.NotSubscribed);
        return true;
      }

      const { currentNotificationIds } = user;
      if (!includes(currentNotificationIds, notificationIdToMarkAsRead)) {
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
