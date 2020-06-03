export type NotificationId = string;

export type GitHubUser = {
  userName: string;
  notificationToken: string;
  currentNotificationIds: NotificationId[];
};

export type DiscordId = string;

export type GitHubUsers = Record<DiscordId, GitHubUser>;

export const cloneGitHubUsers = (users: GitHubUsers): GitHubUsers => {
  return Object.entries(users).reduce(
    (acc, [id, { userName, notificationToken, currentNotificationIds }]) => ({
      ...acc,
      [id]: {
        userName,
        notificationToken,
        currentNotificationIds: [...currentNotificationIds],
      },
    }),
    {},
  );
};
