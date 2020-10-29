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

const FAUNA_SECRET = process.env.FAUNA_SECRET || "UNSET";

export class FaunaDB implements SubscriptionDatabase, UserDatabase {
  #client = new fauna.Client({ secret: FAUNA_SECRET });

  #handlers: UpdateHandler[] = [];

  onUpdate(handler: UpdateHandler): void {
    this.#handlers.push(handler);
  }

  update(id: DiscordId, notificationIds: NotificationId[]): Promise<void> {
    return this.#client.query(
      q.Replace(q.Collection("users", id), { notificationIds }),
    );
  }

  register(id: DiscordId, user: GitHubUser): Promise<void> {
    return this.#client.query(q.Create(q.Collection("users", id), user));
  }

  unregister(id: DiscordId): Promise<boolean> {
    return this.#client.query(q.Delete(q.Collection("users", id)));
  }

  async fetchUser(discordId: DiscordId): Promise<GitHubUser | undefined> {
    const { data } = (await this.#client.query(
      q.Get(q.Collection("users", discordId)),
    )) as { data: GitHubUser | undefined };
    return data;
  }
}
