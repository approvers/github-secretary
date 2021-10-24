import type { DiscordId } from "../../model/discord-id";
import type { GitHubUser } from "../../model/github-user";
import type { NotificationId } from "../../model/github-notification";

export interface UserDatabase {
  register: (id: DiscordId, user: GitHubUser) => Promise<void>;
  unregister: (id: DiscordId) => Promise<boolean>;
  fetchUser(discordId: DiscordId): Promise<GitHubUser | null>;
}

export interface UpdateHandler {
  handleUpdate: (
    discordId: DiscordId,
    user: Readonly<GitHubUser>,
  ) => Promise<void>;
}

export interface SubscriptionDatabase {
  onUpdate: (handler: UpdateHandler) => void;
  update: (
    discordId: DiscordId,
    notificationIds: NotificationId[],
  ) => Promise<void>;
}
