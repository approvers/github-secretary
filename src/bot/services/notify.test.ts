import { Database, Query, notify } from "./notify";
import {
  GitHubNotifications,
  NotificationId,
} from "../model/github-notification";
import { GitHubUser } from "../model/github-user";
import { MessageEmbed } from "discord.js";
import { analectaForTest } from "../adaptors/mock/test-analecta";

const db: Database = {
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
};

const query: Query = {
  fetchNotification: () =>
    Promise.resolve([
      {
        id: "0123456789",
        subject: {
          title: "An Issue",
        },
      },
    ] as GitHubNotifications),
};

test("emit a notification", async () => {
  const analecta = await analectaForTest();

  return notify(db, query)(analecta, (message: MessageEmbed) => {
    expect(message).toEqual(
      new MessageEmbed()
        .addFields([
          {
            name: "#0123456789",
            value: "An Issue",
          },
        ])
        .setTitle(analecta.BringIssue)
        .setURL("https://github.com/notifications"),
    );
    return Promise.resolve();
  });
});
