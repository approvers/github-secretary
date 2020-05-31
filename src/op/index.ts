import { Analecta } from '../exp/analecta';
import { connectProcessors, CommandProcessor } from '../abst/connector';

import { bringIssue } from './bring-issue';
import { bringPR } from './bring-pr';
import { bringRepo } from './bring-repo';
import { flavor } from './flavor';
import { UserDatabase as Subscriber, subscribeNotification } from './subscribe-notification';
import { UserDatabase as Unsubscriber, unsubscribeNotification } from './unsubscribe-notification';

type UserDatabase = Subscriber & Unsubscriber;

export const procs = (analecta: Analecta, db: UserDatabase): CommandProcessor =>
  connectProcessors([
    flavor(new RegExp(analecta.CallPattern)),
    bringIssue,
    bringPR,
    bringRepo,
    subscribeNotification(db),
    unsubscribeNotification(db),
  ]);
