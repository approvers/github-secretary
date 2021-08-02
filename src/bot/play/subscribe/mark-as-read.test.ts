import { DiscordId } from "../../exp/discord-id";
import { GitHubUser } from "../../exp/github-user";
import { MockUserDB } from "../../skin/mock-user-db";
import { MockMessage } from "../../skin/mock-message";
import { NotificationId } from "../../exp/github-notification";
import { analectaForTest } from "../../skin/test-analecta";
import { markAsRead } from "./mark-as-read";

test("mark a notification as read", async () => {
  const analecta = await analectaForTest();
  const db = new MockUserDB({
    userName: "Alice",
    notificationToken: "TEST_TOKEN",
    currentNotificationIds: ["0123456789" as NotificationId],
  } as GitHubUser);

  const proc = markAsRead(db, {
    markAsRead: (_user: GitHubUser, id: NotificationId) => {
      expect(id).toStrictEqual("0123456789");
      return Promise.resolve(true);
    },
  });

  const message = new MockMessage(
    "/ghm 0123456789",
    "alice_discord" as DiscordId,
  );
  await expect(proc(analecta, message)).resolves.toEqual(true);
});
