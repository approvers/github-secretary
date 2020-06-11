declare const nominalNotificationId: unique symbol;
export type NotificationId = string & {
  [nominalNotificationId]: never;
};

export const includes = (notifications: NotificationId[], target: string): boolean =>
  (notifications as string[]).includes(target);
