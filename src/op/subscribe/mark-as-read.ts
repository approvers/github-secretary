import { CommandProcessor } from '../../abst/connector.ts';
import { Analecta } from '../../exp/analecta.ts';
import { GitHubUser } from '../../exp/github-user.ts';
import { DiscordId } from '../../exp/discord-id.ts';
import { replyFailure } from '../../abst/reply-failure.ts';
import { fetchErrorHandler } from '../../skin/fetch-error-handler.ts';
import { Message } from '../../abst/message.ts';
import { includes, NotificationId } from '../../exp/github-notification.ts';
import { EmbedMessage } from '../../exp/embed-message.ts';

export type UserDatabase = {
  fetchUser(discordId: DiscordId): Promise<GitHubUser | undefined>;
};

export type Query = {
  markAsRead(user: GitHubUser, notificationId: NotificationId): Promise<boolean>;
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
        new EmbedMessage().title(analecta.MarkAsRead).url(`https://github.com/notifications`),
      );
      return true;
    })
    .catch(
      fetchErrorHandler(async (embed) => {
        await msg.sendEmbed(embed);
      }),
    );
};
