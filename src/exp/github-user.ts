export type GitHubUser = {
  userName: string;
  notificationToken: string;
  currentNotificationIds: string[];
};

export type DiscordId = string;

export type GitHubUsers = Record<DiscordId, GitHubUser>;
