import { readFileStr } from 'https://deno.land/std/fs/read_file_str.ts';
import { ensureFile } from 'https://deno.land/std/fs/ensure_file.ts';
import { Mutex } from 'https://deno.land/x/mutex/mod.ts';

import { GitHubUser, GitHubUsers, serialize, deserialize } from '../exp/github-user.ts';
import { DiscordId } from '../exp/discord-id.ts';
import { NotificationId } from '../exp/github-notification.ts';
import { SubscriptionDatabase, UserDatabase, UpdateHandler } from '../op/interfaces.ts';

export class PlainDB implements SubscriptionDatabase, UserDatabase {
  private users: GitHubUsers = new Map();
  private handlers: UpdateHandler[] = [];

  private constructor(private fileName: string, private file: Deno.File) {}

  async fetchUser(discordId: DiscordId): Promise<GitHubUser | undefined> {
    return this.users.get(discordId);
  }

  onUpdate(handler: UpdateHandler): void {
    this.handlers.push(handler);
    this.overwrite();
  }

  static async make(fileName: string): Promise<PlainDB> {
    await ensureFile(fileName);
    const handle = await Deno.open(fileName, {
      read: true,
      write: true,
      create: true,
      truncate: false,
    }).catch(async () => {
      await Deno.mkdir('.cache');
      return await Deno.create(fileName);
    });
    const obj = new PlainDB(fileName, handle);
    try {
      const users = await readFileStr(fileName);
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

  async update(id: DiscordId, notificationIds: NotificationId[]): Promise<void> {
    const entry = this.users.get(id);
    if (entry == null) {
      return;
    }
    entry.currentNotificationIds = notificationIds;
    this.users.set(id, entry);
    await this.overwrite();
  }

  private async overwrite(): Promise<void> {
    await Mutex.doAtomic(`plain-db-${this.fileName}`, async () => {
      await this.file.write(new TextEncoder().encode(serialize(this.users)));
    });

    await Promise.all(this.handlers.map((handler) => handler.handleUpdate(this.users)));
  }
}
