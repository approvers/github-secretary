import { MessageEmbed, User } from "discord.js";
import { Database as NotifyController, notify } from "../services/notify";
import type {
  SubscriptionDatabase,
  UpdateHandler,
} from "../services/notify/user-database";
import type { Analecta } from "../model/analecta";
import type { DiscordId } from "../model/discord-id";
import type { GitHubUser } from "../model/github-user";
import type { NotificationId } from "../model/github-notification";
import { notificationQuery } from "../adaptors/github-notification-query";

const safeParseDecimal = (str: string): number => {
  const val = parseInt(str, 10);
  if (Number.isNaN(val)) {
    throw new Error(`Cannot parse \`str\`: ${str}`);
  }
  return val;
};

const retryInterval = () => 1000 + Math.floor(Math.random() * 2);

const NOTIFY_INTERVAL = safeParseDecimal(
  process.env.NOTIFY_INTERVAL || "10000",
);

export type UserDic = {
  fetch: (userId: string) => Promise<User>;
};

interface NotifyTask {
  timer: NodeJS.Timeout;
}

export class SubscriptionNotifier implements UpdateHandler {
  private notifyTasks: Map<DiscordId, NotifyTask> = new Map();

  constructor(
    private analecta: Analecta,
    private users: UserDic,
    private updater: SubscriptionDatabase,
  ) {}

  handleUpdate(id: DiscordId, user: Readonly<GitHubUser>): Promise<void> {
    this.stop(id);

    this.notifyTasks.set(id, this.makeNotifyTask(id, user));
    return Promise.resolve();
  }

  private makeNotifyTask(
    userId: DiscordId,
    sub: Readonly<GitHubUser>,
  ): NotifyTask {
    const notifyHandler = notify(
      this.notifyController(sub, userId),
      notificationQuery,
    );
    const timer = setInterval(
      () =>
        notifyHandler(this.analecta, this.sendMessage(userId)).catch((err) => {
          console.error(err);
          this.stop(userId);
          setTimeout(() => this.handleUpdate(userId, sub), retryInterval());
        }),
      NOTIFY_INTERVAL,
    );
    return { timer };
  }

  private sendMessage(userId: string): (mes: MessageEmbed) => Promise<void> {
    return async (mes: MessageEmbed): Promise<void> => {
      const user = await this.users.fetch(userId);
      const dm = await user.createDM();
      await dm.send({ embeds: [mes] });
    };
  }

  private notifyController(
    sub: Readonly<GitHubUser>,
    userId: DiscordId,
  ): NotifyController {
    return {
      getUser: () => Promise.resolve(sub),
      update: (newIds: NotificationId[]): Promise<void> =>
        this.updater.update(userId, newIds),
    };
  }

  private stop(id: DiscordId): void {
    const task = this.notifyTasks.get(id);
    if (task) {
      clearInterval(task.timer);
      this.notifyTasks.delete(id);
    }
  }
}
