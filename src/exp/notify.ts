import fetch from 'node-fetch';
import { GitHubUser, GitHubUsers, DiscordId } from './github-user';
import { User, Client } from 'discord.js';
import { Analecta } from './analecta';

const notify = (
  fetchInterval: number,
  { userName, notificationToken, currentNotificationIds }: GitHubUser,
  analecta: Analecta,
  idsUpdater: (ids: string[]) => void,
  user: User,
): (() => void) => {
  const timer = setInterval(async () => {
    const rawRes = await fetch(`https://api.github.com/notifications`, {
      headers: {
        Authorization:
          `Basic ` + Buffer.from(`${userName}:${notificationToken}`).toString('base64'),
      },
    });
    const res = [...(await rawRes.json())] as {
      id: string;
      subject: {
        title: string;
      };
    }[];

    const newIds = res.map(({ id }) => id);

    const newIdSet = new Set([...newIds]);
    for (const oldE of currentNotificationIds) {
      newIdSet.delete(oldE);
    }

    if (newIdSet.size <= 0) {
      return;
    }

    idsUpdater(newIds);

    const subjects = res.map(({ id, subject: { title } }) => ({
      name: `#${id}`,
      value: title,
    }));

    if (subjects.length <= 0) {
      return;
    }

    const dm = await user.createDM();
    dm.send({
      embed: {
        title: analecta.BringIssue,
        url: `https://github.com/notifications`,
        fields: subjects,
      },
    });
  }, fetchInterval);
  return (): void => {
    clearInterval(timer);
  };
};

export type Database = {
  subscriptions(): Promise<GitHubUsers>;
  update: (id: DiscordId, notificationIds: string[]) => Promise<void>;
};

export class SubscriptionNotifier {
  notifyTasks: (() => void)[] = [];

  constructor(private analecta: Analecta, private client: Client, private db: Database) {
    this.update();
  }

  async update(): Promise<void> {
    this.stop();
    const subs = await this.db.subscriptions();
    this.notifyTasks = await Promise.all(Object.entries(subs).map(this.makeNotifyTask));
  }

  private makeNotifyTask = async ([userId, sub]: [string, GitHubUser]): Promise<() => void> => {
    return notify(
      60000,
      sub,
      this.analecta,
      (newIds) => {
        this.db.update(userId, newIds);
      },
      await this.client.users.fetch(userId),
    );
  };

  private stop(): void {
    for (const task of this.notifyTasks) {
      task();
    }
  }
}
