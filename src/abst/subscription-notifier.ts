import { GitHubUser, GitHubUsers, DiscordId, NotificationId } from '../exp/github-user';
import { MessageEmbed, User } from 'discord.js';
import { Analecta } from '../exp/analecta';
import { notify, Database as NotifyController } from '../op/subscribe/notify';
import { UpdateHandler } from './subscription-database';

export type Database = {
  update: (id: DiscordId, notificationIds: NotificationId[]) => Promise<void>;
};

const NOTIFY_INTERVAL = parseInt(process.env.NOTIFY_INTERVAL || '10000', 10);

export type UserDic = {
  fetch: (userId: string) => Promise<User>;
};

export type Updater = {
  update: (discordId: DiscordId, notificationIds: NotificationId[]) => Promise<void>;
};

export class SubscriptionNotifier implements UpdateHandler {
  private notifyTasks: (() => void)[] = [];

  constructor(private analecta: Analecta, private users: UserDic, private updater: Updater) {}

  async handleUpdate(users: GitHubUsers): Promise<void> {
    this.stop();
    this.notifyTasks = await Promise.all(
      Object.entries(users).map(([userId, sub]) => this.makeNotifyTask(userId, sub)),
    );
  }

  private makeNotifyTask = (userId: string, sub: GitHubUser): (() => void) => {
    const timer = setInterval(
      notify(this.analecta, this.sendMessage(userId), this.notifyController(sub, userId)),
      NOTIFY_INTERVAL,
    );
    return (): void => {
      clearInterval(timer);
    };
  };

  private sendMessage(userId: string): (mes: MessageEmbed) => Promise<void> {
    return async (mes: MessageEmbed): Promise<void> => {
      const user = await this.users.fetch(userId);
      const dm = await user.createDM();
      await dm.send(mes);
    };
  }

  private notifyController(sub: GitHubUser, userId: string): NotifyController {
    return {
      getUser: async (): Promise<GitHubUser> => sub,
      update: (newIds: NotificationId[]): Promise<void> => this.updater.update(userId, newIds),
    };
  }

  private stop(): void {
    for (const task of this.notifyTasks) {
      task();
    }
  }
}
