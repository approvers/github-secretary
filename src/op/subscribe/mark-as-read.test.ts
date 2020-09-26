import { markAsRead } from "./mark-as-read";
import { MockMessage } from "../../skin/mock-message";
import { analectaForTest } from "../../skin/test-analecta";
import { GitHubUser } from "../../exp/github-user";
import { DiscordId } from "../../exp/discord-id";
import { NotificationId } from "../../exp/github-notification";

test("mark a notification as read", async (done) => {
  const analecta = await analectaForTest();

  const proc = markAsRead(
    {
      fetchUser: async (id: DiscordId) => {
        expect(id).toStrictEqual("alice_discord");

        return ({
          userName: "Alice",
          notificationToken: "TEST_TOKEN",
          currentNotificationIds: ["0123456789" as NotificationId],
        } as unknown) as GitHubUser;
      },
    },
    {
      markAsRead: async (_user: GitHubUser, id: NotificationId) => {
        expect(id).toStrictEqual("0123456789");
        done();
        return true;
      },
    }
  );

  const message = new MockMessage(
    "/ghm 0123456789",
    "alice_discord" as DiscordId
  );
  expect(proc(analecta, message)).resolves.toEqual(true);
});
