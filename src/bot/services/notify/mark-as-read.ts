import { NotificationId, includes } from "../../model/github-notification";
import type { Analecta } from "../../model/analecta";
import { CommandProcessor } from "../../runners/connector";
import type { Message } from "../../model/message";
import type { NotificationApi } from "../command/api";
import type { UserDatabase } from "./user-database";
import { replyFailure } from "../../services/reply-failure";

const markPattern = /^\/ghm (?<notification>[0-9]+)\s*$/u;

export const markAsRead =
  (
    db: UserDatabase,
    query: NotificationApi,
    analecta: Analecta,
  ): CommandProcessor<Message> =>
  async (msg: Message): Promise<boolean> => {
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
      .catch(msg.panic);
  };

const markNotificationAsRead =
  ({
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
    query: NotificationApi;
  }) =>
  async () => {
    const user = await db.fetchUser(msg.getAuthorId());
    if (!user) {
      await msg.reply(analecta.NotSubscribed);
      return true;
    }

    const { currentNotificationIds } = user;
    if (!includes(currentNotificationIds, id)) {
      return replyFailure(analecta)(msg);
    }

    const res = await query.markAsRead(user, id);
    if (!res) {
      return replyFailure(analecta)(msg);
    }

    await msg.sendEmbed({
      title: analecta.MarkAsRead,
      url: "https://github.com/notifications",
    });
    return true;
  };
