import { Analecta } from '../exp/analecta';
import { connectProcessors, CommandProcessor } from '../abst/connector';

import { bringIssue } from './bring-issue';
import { bringPR } from './bring-pr';
import { bringRepo } from './bring-repo';
import { flavor } from './flavor';
import { UserDatabase as Subscriber, subscribeNotification } from './subscribe-notification';
import { UserDatabase as Unsubscriber, unsubscribeNotification } from './unsubscribe-notification';
import { SubscriptionNotifier } from 'src/exp/notify';

type UserDatabase = Subscriber & Unsubscriber;

export const procs = (
  analecta: Analecta,
  db: UserDatabase,
  notifier: SubscriptionNotifier,
): CommandProcessor =>
  connectProcessors([
    flavor(new RegExp(analecta.CallPattern), new RegExp(analecta.BlackPattern)),
    bringIssue,
    bringPR,
    bringRepo,
    subscribeNotification(db, notifier),
    unsubscribeNotification(db, notifier),
  ]);
