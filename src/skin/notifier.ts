import { config } from "https://deno.land/x/dotenv/mod.ts";
import { User, DMChannel } from "https://deno.land/x/coward@v0.3.1/mod.ts";
import { fromUint8Array } from "https://denopkg.com/chiefbiiko/base64/mod.ts";

import { GitHubUser, GitHubUsers } from "../exp/github-user.ts";
import { DiscordId } from "../exp/discord-id.ts";
import {
  NotificationId,
  GitHubNotifications,
} from "../exp/github-notification.ts";
import { Analecta } from "../exp/analecta.ts";
import {
  notify,
  Database as NotifyController,
} from "../op/subscribe/notify.ts";
import { Query } from "../op/subscribe/notify.ts";
import { UpdateHandler } from "../op/interfaces.ts";
import { EmbedMessage } from "../exp/embed-message.ts";

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

const NOTIFY_INTERVAL = safeParseDecimal(config().NOTIFY_INTERVAL || "10000");

export type UserDMDic = {
  fetch: (userId: User["id"]) => Promise<DMChannel>;
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
    const rawRes = await fetch(`https://api.github.com/notifications`, {
      headers: {
        Authorization: `Basic ` +
          fromUint8Array(
            new TextEncoder().encode(`${userName}:${notificationToken}`),
          ),
      },
    });
    if (!rawRes.ok) {
      throw "fail to fetch notifications";
    }
    return [...(await rawRes.json())];
  },
};

export class SubscriptionNotifier implements UpdateHandler {
  private notifyTasks: (() => void)[] = [];

  constructor(
    private analecta: Analecta,
    private users: UserDMDic,
    private updater: Updater,
  ) {}

  async handleUpdate(users: Readonly<GitHubUsers>): Promise<void> {
    this.stop();

    const it = users.entries();
    for (let next = it.next(); !next.done; next = it.next()) {
      const [userId, sub] = next.value;
      this.notifyTasks.push(this.makeNotifyTask(userId as DiscordId, sub));
    }
  }

  private makeNotifyTask = (
    userId: DiscordId,
    sub: GitHubUser,
  ): (() => void) => {
    const timer = setInterval(
      () =>
        notify(
          this.analecta,
          this.sendMessage(userId),
          this.notifyController(sub, userId),
          notificationQuery,
        ).catch((e) => {
          console.error(e);
          clearInterval(timer);
        }),
      NOTIFY_INTERVAL,
    );
    return (): void => {
      clearInterval(timer);
    };
  };

  private sendMessage(userId: string): (mes: EmbedMessage) => Promise<void> {
    return async (mes: EmbedMessage): Promise<void> => {
      const dm = await this.users.fetch(userId);
      dm.createMessage({ embed: mes });
    };
  }

  private notifyController(
    sub: GitHubUser,
    userId: DiscordId,
  ): NotifyController {
    return {
      getUser: async (): Promise<GitHubUser> => sub,
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
