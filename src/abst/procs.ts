import { Analecta } from '../exp/analecta';
import { connectProcessors, CommandProcessor } from './connector';

import { bringIssue } from '../op/bring/issue';
import { bringPR } from '../op/bring/pr';
import { bringRepo } from '../op/bring/repo';
import { error } from '../op/error';
import { flavor } from '../op/flavor';
import { subscribeNotification } from '../op/subscribe/subscribe-notification';
import { unsubscribeNotification } from '../op/subscribe/unsubscribe-notification';

import { UserDatabase as Subscriber } from '../op/subscribe/subscribe-notification';
import { UserDatabase as Unsubscriber } from '../op/subscribe/unsubscribe-notification';
import { UserDatabase as Fetcher } from '../op/subscribe/mark-as-read';

export type UserDatabase = Subscriber & Unsubscriber & Fetcher;

import { markAsRead } from 'src/op/subscribe/mark-as-read';

export const procs = (analecta: Analecta, db: UserDatabase): CommandProcessor =>
  connectProcessors([
    flavor(new RegExp(analecta.CallPattern), new RegExp(analecta.BlackPattern, 'm')),
    bringIssue,
    bringPR,
    bringRepo,
    subscribeNotification(db),
    unsubscribeNotification(db),
    markAsRead(db),
    error,
  ]);
