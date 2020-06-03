import fetch from 'node-fetch';
import { MessageEmbed } from 'discord.js';

import { Analecta } from '../../exp/analecta';
import { GitHubUser, NotificationId } from '../../exp/github-user';

export type Database = {
  getUser(): Promise<GitHubUser>;
  update(ids: NotificationId[]): Promise<void>;
};

export const notify = (
  analecta: Analecta,
  send: (message: MessageEmbed) => Promise<void>,
  db: Database,
) => async (): Promise<void> => {
  const { userName, notificationToken, currentNotificationIds } = await db.getUser();

  const rawRes = await fetch(`https://api.github.com/notifications`, {
    headers: {
      Authorization: `Basic ` + Buffer.from(`${userName}:${notificationToken}`).toString('base64'),
    },
  });
  const res = [...(await rawRes.json())] as {
    id: NotificationId;
    subject: {
      title: string;
    };
  }[];
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
