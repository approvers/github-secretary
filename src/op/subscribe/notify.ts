import { Analecta } from '../../exp/analecta.ts';
import { GitHubUser } from '../../exp/github-user.ts';
import { NotificationId, GitHubNotifications } from '../../exp/github-notification.ts';
import { fetchErrorHandler } from '../../skin/fetch-error-handler.ts';
import { EmbedMessage, EmbedField } from '../../exp/embed-message.ts';

export type Database = {
  getUser(): Promise<GitHubUser>;
  update(ids: NotificationId[]): Promise<void>;
};

export type Query = {
  fetchNotification(user: GitHubUser): Promise<GitHubNotifications>;
};

export const notify = async (
  analecta: Analecta,
  send: (message: EmbedMessage) => Promise<void>,
  db: Database,
  query: Query,
): Promise<void> => {
  const user = await db.getUser();
  const { currentNotificationIds } = user;

  const res = await query.fetchNotification(user).catch(fetchErrorHandler(send));
  const newIds = res.map(({ id }) => id);
  const newIdSet = new Set([...newIds]);
  for (const oldE of currentNotificationIds) {
    newIdSet.delete(oldE);
  }
  await db.update(newIds);

  if (newIdSet.size <= 0) {
    return;
  }

  const subjects: EmbedField[] = res.map(({ id, subject: { title } }) => ({
    name: `#${id}`,
    value: title,
  }));

  await send(
    new EmbedMessage()
      .fields(...subjects)
      .title(analecta.BringIssue)
      .url(`https://github.com/notifications`),
  );
};
