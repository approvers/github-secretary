import { MockUserDB, placeholder } from "../../adaptors/mock/user-db";
import type { DiscordId } from "../../model/discord-id";
import type { GitHubUser } from "../../model/github-user";
import { MockMessage } from "../../adaptors/mock/message";
import { NotificationId } from "../../model/github-notification";
import { Scheduler } from "../../runners/scheduler";
import { analectaForTest } from "../../adaptors/mock/test-analecta";
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
  const scheduler = new Scheduler();

  const proc = subscribeNotification({
    db,
    registry: db,
    query: {
      notifications: () => Promise.resolve([]),
    },
    associator: {
      getGitHubUser: () =>
        Promise.resolve({
          userName: "Alice",
          notificationToken: "TEST_TOKEN",
          currentNotificationIds: [] as NotificationId[],
        } as GitHubUser),
    },
    analecta,
    scheduler,
  });

  const message = new MockMessage(
    "/ghs Alice TEST_TOKEN",
    "alice_discord" as DiscordId,
  );
  await expect(proc(message)).resolves.toEqual(true);
});
