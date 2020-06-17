import { MessageEmbed } from 'discord.js';

import { Analecta } from '../../exp/analecta';
import { GitHubUser, NotificationId } from '../../exp/github-user';
import { fetchErrorHandler } from '../../skin/fetch-error-handler';

export type Database = {
  getUser(): Promise<GitHubUser>;
  update(ids: NotificationId[]): Promise<void>;
};

export type Query = {
  fetchNotification(
    user: GitHubUser,
  ): Promise<
    {
      id: NotificationId;
      subject: {
        title: string;
      };
    }[]
  >;
};

export const notify = async (
  analecta: Analecta,
  send: (message: MessageEmbed) => Promise<void>,
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

  const subjects = res.map(({ id, subject: { title } }) => ({
    name: `#${id}`,
    value: title,
  }));

  await send(
    new MessageEmbed()
      .addFields(subjects)
      .setTitle(analecta.BringIssue)
      .setURL(`https://github.com/notifications`),
  );
};
