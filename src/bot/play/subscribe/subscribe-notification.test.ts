import { MockDB, placeholder } from "../../skin/mock-db";
import { DiscordId } from "../../exp/discord-id";
import { GitHubUser } from "../../exp/github-user";
import { MockMessage } from "../../skin/mock-message";
import { NotificationId } from "../../exp/github-notification";
import { analectaForTest } from "../../skin/test-analecta";
import { subscribeNotification } from "./subscribe-notification";

test("subscribe a member", async (done) => {
  const analecta = await analectaForTest();
  const db = new MockDB({
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
    done();
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
