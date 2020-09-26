import { MessageEmbed } from "discord.js";

import { notify } from "./notify";
import { analectaForTest } from "../../skin/test-analecta";
import { GitHubUser } from "../../exp/github-user";
import {
  NotificationId,
  GitHubNotifications,
} from "../../exp/github-notification";

test("emit a notification", async (done) => {
  const analecta = await analectaForTest();

  expect(
    notify(
      analecta,
      async (message) => {
        expect(message).toEqual(
          new MessageEmbed()
            .addFields([
              {
                name: "#0123456789",
                value: "An Issue",
              },
            ])
            .setTitle(analecta.BringIssue)
            .setURL(`https://github.com/notifications`)
        );
        done();
      },
      {
        getUser: async () =>
          ({
            userName: "Alice",
            notificationToken: "TEST_TOKEN",
            currentNotificationIds: [] as NotificationId[],
          } as GitHubUser),
        update: async (ids) => {
          expect(ids).toEqual(["0123456789"]);
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
      }
    )
  ).resolves.toEqual(undefined);
});
