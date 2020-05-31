import fetch from 'node-fetch';
import { GitHubUser, GitHubUsers } from './github-user';
import { User, Client } from 'discord.js';
import { Analecta } from './analecta';

const notify = (
  fetchInterval: number,
  { userName, notificationToken }: GitHubUser,
  analecta: Analecta,
  user: User,
): (() => void) => {
  const timer = setInterval(async () => {
    const rawRes = await fetch(`https://api.github.com/notifications`, {
      headers: {
        Authorization:
          `Basic ` + Buffer.from(`${userName}:${notificationToken}`).toString('base64'),
      },
    });
    const res = await rawRes.json();

    const subjects = (res as {
      id: number;
      subject: {
        title: string;
        latest_comment_url: string;
      };
    }[]).map(({ id, subject: { title, latest_comment_url } }) => ({
      name: `#${id}`,
      value: `[${title}](${latest_comment_url})`,
    }));

    if (subjects.length <= 0) {
      return;
    }

    const dm = await user.createDM();
    dm.send({
      embed: {
        fields: subjects,
        footer: {
          text: analecta.BringIssue,
        },
      },
    });
  }, fetchInterval);
  return (): void => {
    clearInterval(timer);
  };
};

export type Database = {
  subscriptions(): Promise<GitHubUsers>;
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
      Object.entries(subs).map(async ([userId, sub]) =>
        notify(60000, sub, this.analecta, await this.client.users.fetch(userId)),
      ),
    );
  }

  private stop(): void {
    for (const task of this.notifyTasks) {
      task();
    }
  }
}
