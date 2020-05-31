import { GitHubUser, GitHubUsers, DiscordId, NotificationId } from '../exp/github-user';
import { Client } from 'discord.js';
import { Analecta } from '../exp/analecta';
import { notify } from '../op/subscribe/notify';

export type Database = {
  subscriptions(): Promise<GitHubUsers>;
  update: (id: DiscordId, notificationIds: NotificationId[]) => Promise<void>;
};

export class SubscriptionNotifier {
  notifyTasks: (() => void)[] = [];

  constructor(private analecta: Analecta, private client: Client, private db: Database) {
    this.update();
  }

  async update(): Promise<void> {
    this.stop();
    const subs = await this.db.subscriptions();
    this.notifyTasks = await Promise.all(
      Object.entries(subs).map(([userId, sub]) => this.makeNotifyTask(userId, sub)),
    );
  }

  private makeNotifyTask = (userId: string, sub: GitHubUser): (() => void) => {
    const notifyInterval = 10000;

    const timer = setInterval(
      async () =>
        notify(this.analecta, await this.client.users.fetch(userId), {
          getUser: async () => sub,
          update: async (newIds: NotificationId[]) => {
            this.db.update(userId, newIds);
            this.update();
          },
        }),
      notifyInterval,
    );
    return (): void => {
      clearInterval(timer);
    };
  };

  private stop(): void {
    for (const task of this.notifyTasks) {
      task();
    }
  }
}
