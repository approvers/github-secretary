import {
  GitHubNotifications,
  NotificationId,
} from "../exp/github-notification";
import { GitHubUser, GitHubUsers } from "../exp/github-user";
import { MessageEmbed, User } from "discord.js";
import {
  Database as NotifyController,
  Query,
  notify,
} from "../op/subscribe/notify";
import { Analecta } from "../exp/analecta";
import { DiscordId } from "../exp/discord-id";
import { UpdateHandler } from "../op/interfaces";
import fetch from "node-fetch";

export type Database = {
  update: (id: DiscordId, notificationIds: NotificationId[]) => Promise<void>;
};

const safeParseDecimal = (str: string): number => {
  const val = parseInt(str, 10);
  if (Number.isNaN(val)) {
    throw new Error(`Cannot parse \`str\`: ${str}`);
  }
  return val;
};

const NOTIFY_INTERVAL = safeParseDecimal(
  process.env.NOTIFY_INTERVAL || "10000",
);

export type UserDic = {
  fetch: (userId: string) => Promise<User>;
};

export type Updater = {
  update: (
    discordId: DiscordId,
    notificationIds: NotificationId[],
  ) => Promise<void>;
};

const notificationQuery: Query = {
  async fetchNotification({
    userName,
    notificationToken,
  }: GitHubUser): Promise<GitHubNotifications> {
    const rawRes = await fetch("https://api.github.com/notifications", {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${userName}:${notificationToken}`,
        ).toString("base64")}`,
      },
    });
    if (!rawRes.ok) {
      throw new Error("fail to fetch notifications");
    }
    return [...((await rawRes.json()) as unknown[])] as GitHubNotifications;
  },
};

export class SubscriptionNotifier implements UpdateHandler {
  private notifyTasks: (() => void)[] = [];

  constructor(
    private analecta: Analecta,
    private users: UserDic,
    private updater: Updater,
  ) {}

  handleUpdate(users: Readonly<GitHubUsers>): Promise<void> {
    this.stop();

    const it = users.entries();
    for (let next = it.next(); !next.done; next = it.next()) {
      const [userId, sub] = next.value;
      this.notifyTasks.push(this.makeNotifyTask(userId, sub));
    }
    return Promise.resolve();
  }

  private makeNotifyTask(userId: DiscordId, sub: GitHubUser): () => void {
    const notifyHandler = notify(
      this.notifyController(sub, userId),
      notificationQuery,
    );
    const timer = setInterval(
      () =>
        notifyHandler(this.analecta, this.sendMessage(userId)).catch((err) => {
          console.error(err);
          clearInterval(timer);
        }),
      NOTIFY_INTERVAL,
    );
    return (): void => {
      clearInterval(timer);
    };
  }

  private sendMessage(userId: string): (mes: MessageEmbed) => Promise<void> {
    return async (mes: MessageEmbed): Promise<void> => {
      const user = await this.users.fetch(userId);
      const dm = await user.createDM();
      await dm.send(mes);
    };
  }

  private notifyController(
    sub: GitHubUser,
    userId: DiscordId,
  ): NotifyController {
    return {
      getUser: () => Promise.resolve(sub),
      update: (newIds: NotificationId[]): Promise<void> =>
        this.updater.update(userId, newIds),
    };
  }

  private stop(): void {
    for (const stopTask of this.notifyTasks) {
      stopTask();
    }
    this.notifyTasks = [];
  }
}