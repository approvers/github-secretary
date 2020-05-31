import { Analecta } from '../exp/analecta';
import { connectProcessors, CommandProcessor } from '../abst/connector';

import { bringIssue } from './bring/issue';
import { bringPR } from './bring/pr';
import { bringRepo } from './bring/repo';
import { flavor } from './flavor';
import { subscribeNotification } from './subscribe/subscribe-notification';
import { unsubscribeNotification } from './subscribe/unsubscribe-notification';
import { SubscriptionNotifier } from 'src/abst/subscription-notifier';
import { UserDatabase } from '../abst/user-database';

export const procs = (
  analecta: Analecta,
  db: UserDatabase,
  notifier: SubscriptionNotifier,
): CommandProcessor =>
  connectProcessors([
    flavor(new RegExp(analecta.CallPattern), new RegExp(analecta.BlackPattern, 'm')),
    bringIssue,
    bringPR,
    bringRepo,
    subscribeNotification(db, notifier),
    unsubscribeNotification(db, notifier),
  ]);
