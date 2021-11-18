import type { DiscordId } from "../../model/discord-id";
import { EventEmitter } from "events";
import type { GitHubUser } from "../../model/github-user";
import type { NotificationId } from "src/bot/model/github-notification";
import type { SubscriberRegistry } from "src/bot/services/notify/user-database";
import type { SubscriberRepository } from "src/bot/services/notify";

export const placeholder = Symbol("placeholder for MockDB");

export class MockUserDB implements SubscriberRepository, SubscriberRegistry {
  constructor(private readonly passed?: GitHubUser) {}

  readonly onRegister = new EventEmitter();

  register(id: DiscordId, user: GitHubUser): Promise<void> {
    this.onRegister.emit(placeholder, {
      id,
      user,
    });
    return Promise.resolve();
  }

  readonly onUnregister = new EventEmitter();

  unregister(id: DiscordId): Promise<boolean> {
    this.onUnregister.emit(placeholder, id);
    return Promise.resolve(true);
  }

  user(): Promise<GitHubUser | null> {
    return Promise.resolve(this.passed ?? null);
  }

  readonly onUpdate = new EventEmitter();

  updateNotifications(
    user: DiscordId,
    notifications: readonly NotificationId[],
  ): Promise<void> {
    this.onUpdate.emit(user, notifications);
    return Promise.resolve();
  }
}
