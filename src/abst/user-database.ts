import { UserDatabase as Subscriber } from '../op/subscribe/subscribe-notification';
import { UserDatabase as Unsubscriber } from '../op/subscribe/unsubscribe-notification';
export type UserDatabase = Subscriber & Unsubscriber;
