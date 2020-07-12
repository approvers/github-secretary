import { subscribeNotification } from "./subscribe-notification";
import { MockMessage } from "../../skin/mock-message";
import { analectaForTest } from "../../skin/test-analecta";
import { NotificationId } from "../../exp/github-notification";
import { GitHubUser } from "../../exp/github-user";
import { DiscordId } from "../../exp/discord-id";

test("subscribe a member", async (done) => {
  const analecta = await analectaForTest();

  const proc = subscribeNotification(
    {
      register: async (id, user) => {
        expect(id).toStrictEqual("alice_discord");
        expect(user).toEqual({
          userName: "Alice",
          notificationToken: "TEST_TOKEN",
          currentNotificationIds: [],
        });
        done();
      },
    },
    {
      getGitHubUser: async () =>
        ({
          userName: "Alice",
          notificationToken: "TEST_TOKEN",
          currentNotificationIds: [] as NotificationId[],
        } as GitHubUser),
    }
  );

  const message = new MockMessage(
    "/ghs Alice TEST_TOKEN",
    "alice_discord" as DiscordId
  );
  expect(proc(analecta, message)).resolves.toEqual(true);
});
