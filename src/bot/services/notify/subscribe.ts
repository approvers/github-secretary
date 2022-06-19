import {
  NotificationRepository,
  SubscriberRepository,
  notify,
} from "../notify.js";
import type { Analecta } from "../../model/analecta.js";
import type { CommandProcessor } from "../../runners/connector.js";
import type { Message } from "../../model/message.js";
import type { Scheduler } from "../../runners/scheduler.js";
import type { SubscriberRegistry } from "./user-database.js";
import { UserApi } from "../command.js";

const subscribePattern = /^\/ghs (?<name>[^/:?]+) (?<token>[^/:?]+)\s*$/u;

export interface SubscribeOptions {
  db: SubscriberRepository;
  registry: SubscriberRegistry;
  associator: UserApi;
  query: NotificationRepository;
  analecta: Analecta;
  scheduler: Scheduler;
}

export const subscribeNotification =
  ({
    db,
    registry,
    associator,
    query,
    analecta,
    scheduler,
  }: SubscribeOptions): CommandProcessor<Message> =>
  async (msg: Message): Promise<boolean> => {
    const matches = await msg.matchCommand(subscribePattern);
    if (matches === null || !matches.groups) {
      return false;
    }
    const { name, token } = matches.groups;
    if (!name || !token) {
      return false;
    }

    const user = await associator.getGitHubUser(name, token).catch(msg.panic);

    const destination = msg.getAuthorId();
    await registry.register(destination, user);
    scheduler.start(
      destination as string,
      notify({
        destination,
        db,
        query,
        analecta,
        send: msg.sendEmbed,
      }),
    );
    await msg.reply(analecta.Subscribe);
    return true;
  };
