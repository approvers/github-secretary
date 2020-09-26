import { promises } from "fs";
import MutexPromise from "mutex-promise";

import {
  GitHubUser,
  GitHubUsers,
  serialize,
  deserialize,
} from "../exp/github-user";
import { DiscordId } from "../exp/discord-id";
import { NotificationId } from "../exp/github-notification";
import {
  SubscriptionDatabase,
  UserDatabase,
  UpdateHandler,
} from "../op/interfaces";

const { open, mkdir } = promises;

export class PlainDB implements SubscriptionDatabase, UserDatabase {
  private users: GitHubUsers = new Map();
  private mutex: MutexPromise;
  private handlers: UpdateHandler[] = [];

  private constructor(fileName: string, private handle: promises.FileHandle) {
    this.mutex = new MutexPromise(`plain-db-${fileName}`);
  }

  async fetchUser(discordId: DiscordId): Promise<GitHubUser | undefined> {
    return this.users.get(discordId);
  }

  onUpdate(handler: UpdateHandler): void {
    this.handlers.push(handler);
    this.overwrite();
  }

  static async make(fileName: string): Promise<PlainDB> {
    const handle = await open(fileName, "r+").catch(async () => {
      await mkdir(".cache");
      return await open(fileName, "w+");
    });
    const obj = new PlainDB(fileName, handle);
    try {
      const buf = await handle.readFile();
      const users = JSON.parse(buf.toString());
      obj.users = deserialize(users);
    } catch (ignore) {
      obj.users = new Map();
    }
    return obj;
  }

  async register(id: DiscordId, user: GitHubUser): Promise<void> {
    this.users.set(id, user);
    await this.overwrite();
  }

  async unregister(id: DiscordId): Promise<boolean> {
    if (this.users.get(id) == null) {
      return false;
    }
    this.users.delete(id);
    await this.overwrite();
    return true;
  }

  async update(
    id: DiscordId,
    notificationIds: NotificationId[]
  ): Promise<void> {
    const entry = this.users.get(id);
    if (entry == null) {
      return;
    }
    entry.currentNotificationIds = notificationIds;
    this.users.set(id, entry);
    await this.overwrite();
  }

  private async overwrite(): Promise<void> {
    await this.mutex
      .promise()
      .then(() => this.handle.truncate(0))
      .then(() => this.handle.write(serialize(this.users), 0));

    await Promise.all(
      this.handlers.map((handler) => handler.handleUpdate(this.users))
    );
  }
}
