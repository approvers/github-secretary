import fetch from 'node-fetch';
import { MessageEmbed } from 'discord.js';

import { Analecta } from '../../exp/analecta';
import { GitHubUser, NotificationId } from '../../exp/github-user';

const fetchErrorHandler = (send: (message: MessageEmbed) => Promise<void>) => (
  reason: unknown,
): never => {
  send(
    new MessageEmbed()
      .setColor(0xffc208)
      .setTitle('通知データ取得のエラー発生')
      .setDescription(reason),
  );
  throw reason;
};

export type Database = {
  getUser(): Promise<GitHubUser>;
  update(ids: NotificationId[]): Promise<void>;
};

export const notify = async (
  analecta: Analecta,
  send: (message: MessageEmbed) => Promise<void>,
  db: Database,
): Promise<void> => {
  const { userName, notificationToken, currentNotificationIds } = await db.getUser();

  const rawRes = await fetch(`https://api.github.com/notifications`, {
    headers: {
      Authorization: `Basic ` + Buffer.from(`${userName}:${notificationToken}`).toString('base64'),
    },
  }).catch(fetchErrorHandler(send));
  const res = (await rawRes.json().catch(fetchErrorHandler(send))) as {
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
