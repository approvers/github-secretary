import type { DiscordId } from "../exp/discord-id";
import { EventEmitter } from "events";
import type { GitHubUser } from "../exp/github-user";
import type { UserDatabase } from "../abst/user-database";

export const placeholder = Symbol("placeholder for MockDB");

export class MockDB implements UserDatabase {
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

  fetchUser(): Promise<GitHubUser | null> {
    return Promise.resolve(this.passed ?? null);
  }
}
