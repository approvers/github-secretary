import type { Analecta } from "../../model/analecta";
import type { CommandProcessor } from "../../runners/connector";
import type { Message } from "../../model/message";
import type { Scheduler } from "../../runners/scheduler";
import type { SubscriberRegistry } from "./user-database";

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
