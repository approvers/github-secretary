import { Analecta } from '../exp/analecta';
import { connectProcessors, CommandProcessor } from './connector';

import { bringIssue } from '../op/bring/issue';
import { bringPR } from '../op/bring/pr';
import { bringRepo } from '../op/bring/repo';
import { error } from '../op/error';
import { flavor } from '../op/flavor';
import { subscribeNotification } from '../op/subscribe/subscribe-notification';
import { unsubscribeNotification } from '../op/subscribe/unsubscribe-notification';

import { UserDatabase } from './user-database';

export const procs = (analecta: Analecta, db: UserDatabase): CommandProcessor =>
  connectProcessors([
    flavor(new RegExp(analecta.CallPattern), new RegExp(analecta.BlackPattern, 'm')),
    bringIssue,
    bringPR,
    bringRepo,
    subscribeNotification(db),
    unsubscribeNotification(db),
    error,
  ]);
