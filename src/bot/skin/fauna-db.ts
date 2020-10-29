/* eslint-disable new-cap */

import type {
  SubscriptionDatabase,
  UpdateHandler,
  UserDatabase,
} from "../op/interfaces";
import fauna, { query as q } from "faunadb";
import type { DiscordId } from "../exp/discord-id";
import type { GitHubUser } from "../exp/github-user";
import type { NotificationId } from "../exp/github-notification";

export class FaunaDB implements SubscriptionDatabase, UserDatabase {
  #client: fauna.Client;

  constructor(secret: string) {
    this.#client = new fauna.Client({ secret });
  }

  #handlers: UpdateHandler[] = [];

  onUpdate(handler: UpdateHandler): void {
    this.#handlers.push(handler);
  }

  private async notifyUpdate(id: DiscordId): Promise<void> {
    const { data } = (await this.#client.query(
      q.Match(q.Index("users_by_id"), id),
    )) as {
      data: GitHubUser;
    };

    for (const handler of this.#handlers) {
      handler.handleUpdate(id, data);
    }
  }

  async update(
    id: DiscordId,
    notificationIds: NotificationId[],
  ): Promise<void> {
    await this.#client.query(
      q.Update(q.Ref(q.Collection("users"), id), { notificationIds }),
    );
    await this.notifyUpdate(id);
  }

  async register(id: DiscordId, user: GitHubUser): Promise<void> {
    try {
      await this.#client.query(
        q.Create(q.Ref(q.Collection("users"), id), user),
      );
    } catch (ignore) {
      // Ignore
    }
    for (const handler of this.#handlers) {
      handler.handleUpdate(id, user);
    }
  }

  async unregister(id: DiscordId): Promise<boolean> {
    try {
      await this.#client.query(q.Delete(q.Ref(q.Collection("users"), id)));
    } catch (_err) {
      return false;
    }
    await this.notifyUpdate(id);
    return true;
  }

  async fetchUser(discordId: DiscordId): Promise<GitHubUser | undefined> {
    const { data } = (await this.#client.query(
      q.Match(q.Index("users_by_id", discordId)),
    )) as { data: GitHubUser[] };
    return data[0];
  }
}
