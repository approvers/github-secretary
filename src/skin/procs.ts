import { Analecta } from '../exp/analecta';
import { connectProcessors, CommandProcessor } from '../abst/connector';

import { bringIssue } from '../op/bring/issue';
import { bringPR } from '../op/bring/pr';
import { bringRepo } from '../op/bring/repo';
import { error } from '../op/error';
import { flavor } from '../op/flavor';
import { subscribeNotification } from '../op/subscribe/subscribe-notification';
import { unsubscribeNotification } from '../op/subscribe/unsubscribe-notification';
import { markAsRead } from '../op/subscribe/mark-as-read';

import { UserDatabase, Query } from '../op/interfaces';

export const procs = (analecta: Analecta, db: UserDatabase, query: Query): CommandProcessor =>
  connectProcessors([
    flavor(new RegExp(analecta.CallPattern), new RegExp(analecta.BlackPattern, 'm')),
    bringIssue(query),
    bringPR(query),
    bringRepo(query),
    subscribeNotification(db, query),
    unsubscribeNotification(db),
    markAsRead(db, query),
    error,
  ]);
