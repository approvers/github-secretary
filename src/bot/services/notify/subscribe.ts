import {
  NotificationRepository,
  SubscriberRepository,
  notify,
} from "../notify";
import type { Analecta } from "../../model/analecta";
import type { CommandProcessor } from "../../runners/connector";
import type { Message } from "../../model/message";
import type { Scheduler } from "../../runners/scheduler";
import type { SubscriberRegistry } from "./user-database";
import { UserApi } from "../command";

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
