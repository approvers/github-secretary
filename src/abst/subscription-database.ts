import { UserDatabase as Unsubscriber } from '../op/subscribe/unsubscribe-notification';
import { UserDatabase as Subscriber } from '../op/subscribe/subscribe-notification';
import { Database as HasNotifications } from 'src/abst/subscription-notifier';

export type Database = Subscriber & Unsubscriber & HasNotifications;
