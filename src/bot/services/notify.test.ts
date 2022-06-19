import type {
  GitHubNotifications,
  NotificationId,
} from "../model/github-notification.js";
import {
  NotificationRepository,
  SubscriberRepository,
  notify,
} from "./notify.js";
import type { DiscordId } from "../model/discord-id.js";
import type { EmbedMessage } from "../model/message.js";
import type { GitHubUser } from "../model/github-user.js";
import { analectaForTest } from "../adaptors/mock/test-analecta.js";

const db: SubscriberRepository = {
  user: () =>
    Promise.resolve({
      userName: "Alice",
      notificationToken: "TEST_TOKEN",
      currentNotificationIds: [] as NotificationId[],
    } as GitHubUser),
  updateNotifications: (ids) => {
    expect(ids).toEqual(["0123456789"]);
    return Promise.resolve();
  },
};

const query: NotificationRepository = {
  notifications: () =>
    Promise.resolve([
      {
        id: "0123456789",
        subject: {
          title: "An Issue",
        },
      },
    ] as GitHubNotifications),
};

test("emit a notification", async () => {
  const analecta = await analectaForTest();

  return notify({
    destination: "alice_discord" as DiscordId,
    db,
    query,
    analecta,
    send: (message: EmbedMessage) => {
      expect(message).toEqual({
        fields: [
          {
            name: "#0123456789",
            value: "An Issue",
          },
        ],
        title: analecta.BringIssue,
        url: "https://github.com/notifications",
      });
      return Promise.resolve();
    },
  });
});
