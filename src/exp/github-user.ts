import { NotificationId } from './notifications';
import { DiscordId } from './discord-id';

export type GitHubUser = {
  userName: string;
  notificationToken: string;
  currentNotificationIds: NotificationId[];
};

export type GitHubUsers = Map<DiscordId, GitHubUser>;
