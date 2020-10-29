/* eslint-disable new-cap */

import type { GitHubUser, GitHubUsers } from "../exp/github-user";
import type {
  SubscriptionDatabase,
  UpdateHandler,
  UserDatabase,
} from "../op/interfaces";
import fauna, { query as q } from "faunadb";
import type { DiscordId } from "../exp/discord-id";
import type { NotificationId } from "../exp/github-notification";

const FAUNA_SECRET = process.env.FAUNA_SECRET || "UNSET";

export class FaunaDB implements SubscriptionDatabase, UserDatabase {
  #client = new fauna.Client({ secret: FAUNA_SECRET });

  #handlers: UpdateHandler[] = [];

  onUpdate(handler: UpdateHandler): void {
    this.#handlers.push(handler);
  }

  private async notifyUpdate(): Promise<void> {
    const { data } = (await this.#client.query(
      q.Match(q.Index("all_users")),
    )) as {
      data: ({ id: DiscordId } & GitHubUser)[];
    };
    const users = data.reduce(
      (prev, { id, ...rest }) => ({
        ...prev,
        [id]: { ...rest },
      }),
      {} as GitHubUsers,
    );

    for (const handler of this.#handlers) {
      handler.handleUpdate(users);
    }
  }

  async update(
    id: DiscordId,
    notificationIds: NotificationId[],
  ): Promise<void> {
    await this.#client.query(
      q.Update(q.Ref(q.Collection("users"), id), { notificationIds }),
    );
    await this.notifyUpdate();
  }

  async register(id: DiscordId, user: GitHubUser): Promise<void> {
    await this.#client.query(q.Create(q.Ref(q.Collection("users"), id), user));
    await this.notifyUpdate();
  }

  async unregister(id: DiscordId): Promise<boolean> {
    try {
      await this.#client.query(q.Delete(q.Ref(q.Collection("users"), id)));
    } catch (_err) {
      return false;
    }
    await this.notifyUpdate();
    return true;
  }

  async fetchUser(discordId: DiscordId): Promise<GitHubUser | undefined> {
    const { data } = (await this.#client.query(
      q.Match(q.Index("users_by_id", discordId)),
    )) as { data: GitHubUser[] };
    return data[0];
  }
}
