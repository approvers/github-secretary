import { DiscordId } from '../../exp/github-user';
import { Message } from 'discord.js';
import { Analecta } from '../../exp/analecta';
import { CommandProcessor } from '../../abst/connector';
import { SubscriptionNotifier } from 'src/abst/subscription-notifier';

export type UserDatabase = {
  unregister: (id: DiscordId) => Promise<boolean>;
};

const unsubscribePattern = /^\/ghu( .*)?/;

export const unsubscribeNotification = (
  db: UserDatabase,
  notifier: SubscriptionNotifier,
): CommandProcessor => async (analecta: Analecta, msg: Message): Promise<boolean> => {
  if (!unsubscribePattern.test(msg.content)) {
    return false;
  }

  const suceed = await db.unregister(msg.author.id);
  if (!suceed) {
    msg.reply(analecta.NotSubscribed);
    return true;
  }
  await notifier.update();

  msg.reply(analecta.Unsubscribe);
  return true;
};
