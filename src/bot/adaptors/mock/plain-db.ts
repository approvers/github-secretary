import {
  GitHubUser,
  GitHubUsers,
  deserialize,
  serialize,
} from "../../model/github-user";
import type {
  SubscriptionDatabase,
  UpdateHandler,
  UserDatabase,
} from "../../services/notify/user-database";
import type { DiscordId } from "../../model/discord-id";
import MutexPromise from "mutex-promise";
import type { NotificationId } from "../../model/github-notification";
import path from "path";
import { promises } from "fs";

export class PlainDB implements SubscriptionDatabase, UserDatabase {
  private users: GitHubUsers = new Map<DiscordId, GitHubUser>();

  private mutex: MutexPromise;

  private handlers: UpdateHandler[] = [];

  private constructor(fileName: string, private handle: promises.FileHandle) {
    this.mutex = new MutexPromise(`plain-db-${fileName}`);
  }

  fetchUser(discordId: DiscordId): Promise<GitHubUser | null> {
    return Promise.resolve(this.users.get(discordId) ?? null);
  }

  onUpdate(handler: UpdateHandler): void {
    this.handlers.push(handler);
  }

  static async make(fileName: string): Promise<PlainDB> {
    const handle = await readyFile(fileName);
    const obj = new PlainDB(fileName, handle);
    try {
      const buf = await handle.readFile();
      obj.users = deserialize(buf.toString());
    } catch (ignore) {
      obj.users = new Map<DiscordId, GitHubUser>();
    }
    return obj;
  }

  async register(id: DiscordId, user: GitHubUser): Promise<void> {
    this.users.set(id, user);
    await this.overwrite(id);
  }

  async unregister(id: DiscordId): Promise<boolean> {
    if (!this.users.get(id)) {
      return false;
    }
    this.users.delete(id);
    await this.overwrite(id);
    return true;
  }

  async update(
    id: DiscordId,
    notificationIds: NotificationId[],
  ): Promise<void> {
    const entry = this.users.get(id);
    if (!entry) {
      return;
    }
    entry.currentNotificationIds = notificationIds;
    this.users.set(id, entry);
    await this.overwrite(id);
  }

  private async overwrite(id: DiscordId): Promise<void> {
    await this.mutex
      .promise()
      .then(() => this.handle.truncate(0))
      .then(() => this.handle.write(serialize(this.users), 0));

    const user = this.users.get(id);
    if (!user) {
      return;
    }
    await Promise.all(
      this.handlers.map((handler) => handler.handleUpdate(id, user)),
    );
  }
}

const { open, mkdir } = promises;

const readyFile = async (fileName: string): Promise<promises.FileHandle> => {
  try {
    return await open(fileName, "r+");
  } catch (err) {
    if ((err as { code?: string }).code !== "ENOENT") {
      // Unexpected error
      throw err;
    }
    console.log("Database file doesn't exist, so start to make a new one.");
    const dir = path.dirname(fileName);
    await mkdir(dir, { recursive: true });
    return open(fileName, "w+");
  }
};