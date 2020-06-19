import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import { notify } from "./notify.ts";
import { analectaForTest } from "../../skin/test-analecta.ts";
import { GitHubUser } from "../../exp/github-user.ts";
import {
  NotificationId,
  GitHubNotifications,
} from "../../exp/github-notification.ts";
import { EmbedMessage } from "../../exp/embed-message.ts";

Deno.test("emit a notification", async () => {
  const analecta = analectaForTest;

  assertEquals(
    await notify(
      analecta,
      async (message) => {
        assertEquals(
          message,
          new EmbedMessage()
            .field({
              name: "#0123456789",
              value: "An Issue",
            })
            .title(analecta.BringIssue)
            .url(`https://github.com/notifications`),
        );
      },
      {
        getUser: async () => ({
          userName: "Alice",
          notificationToken: "TEST_TOKEN",
          currentNotificationIds: [] as NotificationId[],
        } as GitHubUser),
        update: async (ids) => {
          assertEquals(ids, ["0123456789"]);
        },
      },
      {
        fetchNotification: async () =>
          [
            {
              id: "0123456789",
              subject: {
                title: "An Issue",
              },
            },
          ] as GitHubNotifications,
      },
    ),
    undefined,
  );
});
