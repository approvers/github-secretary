import { promises } from 'fs';
import MutexPromise from 'mutex-promise';

import { GitHubUser, DiscordId, GitHubUsers } from '../exp/github-user';
import { UserDatabase as Unsubscriber } from '../op/unsubscribe-notification';
import { UserDatabase as Subscriber } from '../op/subscribe-notification';
import { Database as HasNotifications } from 'src/exp/notify';

const { open } = promises;

export class PlainDB implements Subscriber, Unsubscriber, HasNotifications {
  private users: GitHubUsers = {};
  private mutex: MutexPromise;

  constructor(fileName: string, private handle: promises.FileHandle) {
    this.mutex = new MutexPromise(`plain-db-${fileName}`);
  }

  static async make(fileName: string): Promise<PlainDB> {
    const handle = await open(fileName, 'r+').catch(() => open(fileName, 'w+'));
    const obj = new PlainDB(fileName, handle);
    try {
      const buf = await handle.readFile();
      const previousUsers = JSON.parse(buf.toString());
      obj.users = previousUsers.users;
    } catch (ignore) {
      obj.users = {};
    }
    return obj;
  }

  register = async (id: DiscordId, user: GitHubUser): Promise<void> => {
    this.users[id] = user;
    await this.overwrite();
  };

  unregister = async (id: DiscordId): Promise<boolean> => {
    if (this.users[id] == null) {
      return false;
    }
    delete this.users[id];
    await this.overwrite();
    return true;
  };

  subscriptions = async (): Promise<GitHubUsers> => {
    return { ...this.users };
  };

  update = async (id: string, notificationIds: string[]): Promise<void> => {
    if (this.users[id] == null) {
      return;
    }
    this.users[id].currentNotificationIds = notificationIds;
    await this.overwrite();
  };

  private overwrite = async (): Promise<void> => {
    await this.mutex
      .promise()
      .then(() => this.handle.truncate(0))
      .then(() => this.handle.write(JSON.stringify({ users: this.users }), 0));
  };
}
