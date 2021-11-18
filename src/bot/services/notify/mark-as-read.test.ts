import { DiscordId } from "../../model/discord-id";
import { GitHubUser } from "../../model/github-user";
import { MockMessage } from "../../adaptors/mock/message";
import { MockUserDB } from "../../adaptors/mock/user-db";
import { NotificationId } from "../../model/github-notification";
import { analectaForTest } from "../../adaptors/mock/test-analecta";
import { markAsRead } from "./mark-as-read";

test("mark a notification as read", async () => {
  const analecta = await analectaForTest();
  const db = new MockUserDB({
    userName: "Alice",
    notificationToken: "TEST_TOKEN",
    currentNotificationIds: ["0123456789" as NotificationId],
  } as GitHubUser);

  const proc = markAsRead(
    db,
    {
      markAsRead: (_user: GitHubUser, id: NotificationId) => {
        expect(id).toStrictEqual("0123456789");
        return Promise.resolve(true);
      },
    },
    analecta,
  );

  const message = new MockMessage(
    "/ghm 0123456789",
    "alice_discord" as DiscordId,
  );
  await expect(proc(message)).resolves.toEqual(true);
});
