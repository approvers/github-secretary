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

  await expect(
    notify(
      analecta,
      (message) => {
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
        return Promise.resolve();
      },
      {
        getUser: () =>
          Promise.resolve({
            userName: "Alice",
            notificationToken: "TEST_TOKEN",
            currentNotificationIds: [] as NotificationId[],
          } as GitHubUser),
        update: (ids) => {
          expect(ids).toEqual(["0123456789"]);
          return Promise.resolve();
        },
      },
      {
        fetchNotification: () =>
          Promise.resolve([
            {
              id: "0123456789",
              subject: {
                title: "An Issue",
              },
            },
          ] as GitHubNotifications),
      }
    )
  ).resolves.toEqual(undefined);
});
