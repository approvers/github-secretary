/* eslint-disable new-cap */

import type { DiscordId } from "../model/discord-id.js";
import type { GitHubUser } from "../model/github-user.js";
import type { NotificationId } from "../model/github-notification.js";
import type { SubscriberRepository } from "../services/notify.js";
import fauna from "faunadb";
// eslint-disable-next-line id-length
const { query: q } = fauna;

export class FaunaDB implements SubscriberRepository {
  private client: fauna.Client;

  constructor(secret: string) {
    this.client = new fauna.Client({ secret });
  }

  async updateNotifications(
    id: DiscordId,
    notificationIds: readonly NotificationId[],
  ): Promise<void> {
    await this.client.query(
      q.Update(q.Ref(q.Collection("users"), id), {
        data: { currentNotificationIds: notificationIds },
      }),
    );
  }

  async register(id: DiscordId, user: GitHubUser): Promise<void> {
    try {
      await this.client.query(
        q.Create(q.Ref(q.Collection("users"), id), { data: { ...user } }),
      );
    } catch (error) {
      console.error(error);
    }
  }

  async unregister(id: DiscordId): Promise<boolean> {
    try {
      await this.client.query(q.Delete(q.Ref(q.Collection("users"), id)));
    } catch {
      return false;
    }
    return true;
  }

  async user(discordId: DiscordId): Promise<GitHubUser | null> {
    try {
      const { data } = (await this.client.query(
        q.Get(q.Ref(q.Collection("users"), discordId)),
      )) as { data: GitHubUser };
      return data;
    } catch {
      return null;
    }
  }
}
