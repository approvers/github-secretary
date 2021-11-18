import { NotificationId, includes } from "../../model/github-notification";
import type { Analecta } from "../../model/analecta";
import type { CommandProcessor } from "../../runners/connector";
import type { Message } from "../../model/message";
import type { NotificationApi } from "../command/api";
import type { SubscriberRepository } from "../notify";
import { replyFailure } from "../../services/reply-failure";

const markPattern = /^\/ghm (?<notification>[0-9]+)\s*$/u;

export const markAsRead =
  (
    db: SubscriberRepository,
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

interface MarkAsReadOptions {
  db: SubscriberRepository;
  msg: Message;
  analecta: Analecta;
  id: NotificationId;
  query: NotificationApi;
}

const markNotificationAsRead =
  ({ db, msg, analecta, id, query }: MarkAsReadOptions) =>
  async () => {
    const user = await db.user(msg.getAuthorId());
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
