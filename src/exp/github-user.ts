export type NotificationId = string;

export type GitHubUser = {
  userName: string;
  notificationToken: string;
  currentNotificationIds: NotificationId[];
};

export type DiscordId = string;

export type GitHubUsers = Record<DiscordId, GitHubUser>;
