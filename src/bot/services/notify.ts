import type {
  GitHubNotifications,
  NotificationId,
} from "../model/github-notification.js";
import type { Analecta } from "../model/analecta.js";
import type { DiscordId } from "../model/discord-id.js";
import type { EmbedMessage } from "../model/message.js";
import type { GitHubUser } from "../model/github-user.js";
import type { ScheduledTask } from "../runners/scheduler.js";

export interface NotificationRepository {
  notifications(user: GitHubUser): Promise<GitHubNotifications>;
}

export interface SubscriberRepository {
  user(discordId: DiscordId): Promise<GitHubUser | null>;
  updateNotifications(
    user: DiscordId,
    notifications: readonly NotificationId[],
  ): Promise<void>;
}

export interface NotificationSender {
  (message: EmbedMessage): Promise<void>;
}

const fetchErrorHandler = (send: NotificationSender, reason: unknown) => {
  const yellow = 0xffc208;
  send({
    color: yellow,
    title: "通知データ取得のエラー発生",
    description: `${reason}`,
  });
  return null;
};

const hasIdsUpdated = (
  older: readonly NotificationId[],
  newer: readonly NotificationId[],
): boolean => {
  const newIdSet = new Set([...newer]);
  for (const oldE of older) {
    newIdSet.delete(oldE);
  }
  return newIdSet.size !== 0;
};

const sendSubjects = async (
  res: GitHubNotifications,
  send: NotificationSender,
  analecta: Analecta,
) => {
  const subjects = res.map(({ id, subject: { title } }) => ({
    name: `#${id}`,
    value: title,
  }));

  await send({
    fields: subjects,
    title: analecta.BringIssue,
    url: "https://github.com/notifications",
  });
};

const safeParseDecimal = (str: string): number => {
  const val = parseInt(str, 10);
  if (Number.isNaN(val)) {
    throw new Error(`Cannot parse \`str\`: ${str}`);
  }
  return val;
};

const retryInterval = () => 1000 + Math.floor(Math.random() * 2);

const NOTIFY_INTERVAL = safeParseDecimal(
  process.env.NOTIFY_INTERVAL || "10000",
);

export interface NotifyOptions {
  destination: DiscordId;
  db: SubscriberRepository;
  query: NotificationRepository;
  analecta: Analecta;
  send: NotificationSender;
}

export const notify =
  ({ destination, db, query, analecta, send }: NotifyOptions): ScheduledTask =>
  async () => {
    const user = await db.user(destination);
    if (!user) {
      return null;
    }
    const { currentNotificationIds } = user;

    const res = await query
      .notifications(user)
      .catch((reason) => fetchErrorHandler(send, reason));
    if (res === null) {
      return retryInterval();
    }
    const newIds = res.map(({ id }) => id);
    await db.updateNotifications(destination, newIds);

    if (hasIdsUpdated(currentNotificationIds, newIds)) {
      await sendSubjects(res, send, analecta);
    }
    return NOTIFY_INTERVAL;
  };
