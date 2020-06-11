import fetch from 'node-fetch';
import { MessageEmbed, User } from 'discord.js';

import { GitHubUser, GitHubUsers, DiscordId, NotificationId } from '../../exp/github-user';
import { Analecta } from '../../exp/analecta';
import { notify, Database as NotifyController } from '../../op/subscribe/notify';
import { Query } from '../../op/subscribe/notify';
import { UpdateHandler } from './database';

export type Database = {
  update: (id: DiscordId, notificationIds: NotificationId[]) => Promise<void>;
};

const safeParseDecimal = (str: string): number => {
  const val = parseInt(str, 10);
  if (Number.isNaN(val)) {
    throw new Error(`Cannot parse \`str\`: ${str}`);
  }
  return val;
};

const NOTIFY_INTERVAL = safeParseDecimal(process.env.NOTIFY_INTERVAL || '10000');

export type UserDic = {
  fetch: (userId: string) => Promise<User>;
};

export type Updater = {
  update: (discordId: DiscordId, notificationIds: NotificationId[]) => Promise<void>;
};

const notificationQuery: Query = {
  async fetchNotification({
    userName,
    notificationToken,
  }: GitHubUser): Promise<
    {
      id: NotificationId;
      subject: {
        title: string;
      };
    }[]
  > {
    const rawRes = await fetch(`https://api.github.com/notifications`, {
      headers: {
        Authorization:
          `Basic ` + Buffer.from(`${userName}:${notificationToken}`).toString('base64'),
      },
    });
    if (!rawRes.ok) {
      throw 'fail to fetch notifications';
    }
    return [...(await rawRes.json())];
  },
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
      () =>
        notify(
          this.analecta,
          this.sendMessage(userId),
          this.notifyController(sub, userId),
          notificationQuery,
        ),
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
    for (const stopTask of this.notifyTasks) {
      stopTask();
    }
  }
}
