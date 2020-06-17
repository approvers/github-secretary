import { NotificationId } from './notifications';
import { DiscordId } from './discord-id';

declare const nominalGitHubUser: unique symbol;
export type GitHubUser = {
  userName: string;
  notificationToken: string;
  currentNotificationIds: NotificationId[];
  [nominalGitHubUser]: never;
};

export type GitHubUsers = Map<DiscordId, GitHubUser>;
