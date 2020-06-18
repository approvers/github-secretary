import { Analecta } from '../exp/analecta.ts';
import { connectProcessors, CommandProcessor } from '../abst/connector.ts';

import { bringIssue } from '../op/bring/issue.ts';
import { bringPR } from '../op/bring/pr.ts';
import { bringRepo } from '../op/bring/repo.ts';
import { error } from '../op/error.ts';
import { flavor } from '../op/flavor.ts';
import { subscribeNotification } from '../op/subscribe/subscribe-notification.ts';
import { unsubscribeNotification } from '../op/subscribe/unsubscribe-notification.ts';
import { markAsRead } from '../op/subscribe/mark-as-read.ts';

import { UserDatabase, Query } from '../op/interfaces.ts';

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
