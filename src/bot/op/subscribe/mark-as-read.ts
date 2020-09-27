import { NotificationId, includes } from "../../exp/github-notification";
import { Analecta } from "../../exp/analecta";
import { CommandProcessor } from "../../abst/connector";
import { DiscordId } from "../../exp/discord-id";
import { GitHubUser } from "../../exp/github-user";
import { Message } from "../../abst/message";
import { MessageEmbed } from "discord.js";
import { fetchErrorHandler } from "../../skin/fetch-error-handler";
import { replyFailure } from "../../abst/reply-failure";

export type UserDatabase = {
  fetchUser(discordId: DiscordId): Promise<GitHubUser | undefined>;
};

export type Query = {
  markAsRead(
    user: GitHubUser,
    notificationId: NotificationId,
  ): Promise<boolean>;
};

const markPattern = /^\/ghm (?<notification>[0-9]+)$/u;

export const markAsRead = (
  db: UserDatabase,
  query: Query,
): CommandProcessor => async (
  analecta: Analecta,
  msg: Message,
): Promise<boolean> => {
  const matches = await msg.matchCommand(markPattern);
  if (matches === null) {
    return false;
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const notificationId = matches.groups!.notification as NotificationId;

  return msg
    .withTyping(
      markNotificationAsRead({
        db,
        msg,
        analecta,
        id: notificationId,
        query,
      }),
    )
    .catch(fetchErrorHandler((embed) => msg.sendEmbed(embed)));
};

const markNotificationAsRead = ({
  db,
  msg,
  analecta,
  id,
  query,
}: {
  db: UserDatabase;
  msg: Message;
  analecta: Analecta;
  id: NotificationId;
  query: Query;
}) => async () => {
  const user = await db.fetchUser(msg.getAuthorId());
  if (!user) {
    await msg.reply(analecta.NotSubscribed);
    return true;
  }

  const { currentNotificationIds } = user;
  if (!includes(currentNotificationIds, id)) {
    return replyFailure(analecta, msg);
  }

  const res = await query.markAsRead(user, id);
  if (!res) {
    return replyFailure(analecta, msg);
  }

  await msg.sendEmbed(
    new MessageEmbed()
      .setTitle(analecta.MarkAsRead)
      .setURL("https://github.com/notifications"),
  );
  return true;
};
