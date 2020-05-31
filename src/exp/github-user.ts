export type GitHubUser = {
  userName: string;
  notificationToken: string;
};

export type DiscordId = string;

export type GitHubUsers = Record<DiscordId, GitHubUser>;
