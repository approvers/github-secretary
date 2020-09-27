declare const nominalNotificationId: unique symbol;
export type NotificationId = string & {
  [nominalNotificationId]: never;
};

export interface GitHubNotification {
  id: NotificationId;
  subject: {
    title: string;
  };
}

export type GitHubNotifications = GitHubNotification[];

export const includes = (
  notifications: NotificationId[],
  target: string
): boolean => (notifications as string[]).includes(target);
