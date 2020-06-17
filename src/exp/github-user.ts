declare const nominalNotificationId: unique symbol;
export type NotificationId = string & {
  [nominalNotificationId]: never;
};

declare const nominalGitHubUser: unique symbol;
export type GitHubUser = {
  userName: string;
  notificationToken: string;
  currentNotificationIds: NotificationId[];
  [nominalGitHubUser]: never;
};

declare const nominalDiscordId: unique symbol;
export type DiscordId = string & {
  [nominalDiscordId]: never;
};

export type GitHubUsers = Record<DiscordId, GitHubUser>;

export const cloneGitHubUsers = (users: GitHubUsers): GitHubUsers => {
  return Object.entries<GitHubUser>(users).reduce(
    (acc: GitHubUsers, [id, { userName, notificationToken, currentNotificationIds }]) => ({
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
