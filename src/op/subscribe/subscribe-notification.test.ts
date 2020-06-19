import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import { subscribeNotification } from "./subscribe-notification.ts";
import { MockMessage } from "../../skin/mock-message.ts";
import { analectaForTest } from "../../skin/test-analecta.ts";
import { NotificationId } from "../../exp/github-notification.ts";
import { GitHubUser } from "../../exp/github-user.ts";
import { DiscordId } from "../../exp/discord-id.ts";

Deno.test("subscribe a member", async () => {
  const analecta = analectaForTest;

  const proc = subscribeNotification(
    {
      register: async (id, user) => {
        assertEquals(id, "alice_discord");
        assertEquals(user, {
          userName: "Alice",
          notificationToken: "TEST_TOKEN",
          currentNotificationIds: [],
        });
      },
    },
    {
      getGitHubUser: async () => ({
        userName: "Alice",
        notificationToken: "TEST_TOKEN",
        currentNotificationIds: [] as NotificationId[],
      } as GitHubUser),
    },
  );

  const message = new MockMessage(
    "/ghs Alice TEST_TOKEN",
    "alice_discord" as DiscordId,
  );
  assertEquals(await proc(analecta, message), true);
});
