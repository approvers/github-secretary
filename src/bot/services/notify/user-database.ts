import type { DiscordId } from "../../model/discord-id.js";
import type { GitHubUser } from "../../model/github-user.js";

export interface SubscriberRegistry {
  register: (id: DiscordId, user: GitHubUser) => Promise<void>;
  unregister: (id: DiscordId) => Promise<boolean>;
}
