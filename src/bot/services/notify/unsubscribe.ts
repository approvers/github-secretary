import type { Analecta } from "../../model/analecta.js";
import type { CommandProcessor } from "../../runners/connector.js";
import type { Message } from "../../model/message.js";
import type { Scheduler } from "../../runners/scheduler.js";
import type { SubscriberRegistry } from "./user-database.js";

const unsubscribePattern = /^\/ghu(?: .*)?/u;

export const unsubNotification =
  (
    db: SubscriberRegistry,
    analecta: Analecta,
    scheduler: Scheduler,
  ): CommandProcessor<Message> =>
  async (msg: Message): Promise<boolean> => {
    if (!(await msg.matchCommand(unsubscribePattern))) {
      return false;
    }

    const id = msg.getAuthorId();
    const succeed = await db.unregister(id);
    if (!succeed) {
      await msg.reply(analecta.NotSubscribed);
      return true;
    }

    scheduler.stop(id);
    await msg.reply(analecta.Unsubscribe);
    return true;
  };
