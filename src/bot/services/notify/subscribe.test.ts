import { MockUserDB, placeholder } from "../../adaptors/mock/user-db";
import { DiscordId } from "../../model/discord-id";
import { GitHubUser } from "../../model/github-user";
import { MockMessage } from "../../adaptors/mock/message";
import { NotificationId } from "../../model/github-notification";
import { analectaForTest } from "../../adaptors/test-analecta";
import { subscribeNotification } from "./subscribe";

test("subscribe a member", async () => {
  const analecta = await analectaForTest();
  const db = new MockUserDB({
    userName: "Alice",
    notificationToken: "TEST_TOKEN",
    currentNotificationIds: [] as NotificationId[],
  } as GitHubUser);
  db.onRegister.on(placeholder, ({ id, user }) => {
    expect(id).toStrictEqual("alice_discord");
    expect(user).toEqual({
      userName: "Alice",
      notificationToken: "TEST_TOKEN",
      currentNotificationIds: [],
    });
  });

  const proc = subscribeNotification(db, {
    getGitHubUser: () =>
      Promise.resolve({
        userName: "Alice",
        notificationToken: "TEST_TOKEN",
        currentNotificationIds: [] as NotificationId[],
      } as GitHubUser),
  });

  const message = new MockMessage(
    "/ghs Alice TEST_TOKEN",
    "alice_discord" as DiscordId,
  );
  await expect(proc(analecta, message)).resolves.toEqual(true);
});
