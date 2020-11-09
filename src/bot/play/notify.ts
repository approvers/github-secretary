import type {
  GitHubNotifications,
  NotificationId,
} from "../exp/github-notification";
import type { Analecta } from "../exp/analecta";
import type { GitHubUser } from "../exp/github-user";
import { MessageEmbed } from "discord.js";
import { fetchErrorHandler } from "../skin/fetch-error-handler";

export type Database = {
  getUser(): Promise<GitHubUser>;
  update(ids: NotificationId[]): Promise<void>;
};

export type Query = {
  fetchNotification(user: GitHubUser): Promise<GitHubNotifications>;
};

export const notify = (db: Database, query: Query) => async (
  analecta: Analecta,
  send: (message: MessageEmbed) => Promise<void>,
): Promise<void> => {
  const user = await db.getUser();
  const { currentNotificationIds } = user;

  const res = await query
    .fetchNotification(user)
    .catch(fetchErrorHandler((message) => send(message)));
  const newIds = res.map(({ id }) => id);
  const newIdSet = new Set([...newIds]);
  for (const oldE of currentNotificationIds) {
    newIdSet.delete(oldE);
  }
  await db.update(newIds);

  if (newIdSet.size === 0) {
    return;
  }

  const subjects = res.map(({ id, subject: { title } }) => ({
    name: `#${id}`,
    value: title,
  }));

  await send(
    new MessageEmbed()
      .addFields(subjects)
      .setTitle(analecta.BringIssue)
      .setURL("https://github.com/notifications"),
  );
};
