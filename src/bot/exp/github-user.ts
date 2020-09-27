import { NotificationId } from "./github-notification";
import { DiscordId } from "./discord-id";

declare const nominalGitHubUser: unique symbol;
export type GitHubUser = {
  userName: string;
  notificationToken: string;
  currentNotificationIds: NotificationId[];
  [nominalGitHubUser]: never;
};

export type GitHubUsers = Map<DiscordId, GitHubUser>;

export const serialize = (users: GitHubUsers): string => {
  const obj: { [key: string]: GitHubUser } = {};
  const it = users.entries();
  for (let next = it.next(); !next.done; next = it.next()) {
    const [k, v] = next.value;
    obj[k as string] = v;
  }
  return JSON.stringify(obj);
};

export const deserialize = (serial: string): GitHubUsers => {
  const parsed = JSON.parse(serial) as { [key: string]: GitHubUser };
  const map = new Map<DiscordId, GitHubUser>();
  for (const [k, v] of Object.entries(parsed)) {
    map.set(k as DiscordId, v);
  }
  return map;
};
