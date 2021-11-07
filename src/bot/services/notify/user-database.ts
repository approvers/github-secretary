import type { DiscordId } from "../../model/discord-id";
import type { GitHubUser } from "../../model/github-user";

export interface SubscriberRegistry {
  register: (id: DiscordId, user: GitHubUser) => Promise<void>;
  unregister: (id: DiscordId) => Promise<boolean>;
}
