import { UserDatabase as Unsubscriber } from '../../op/subscribe/unsubscribe-notification';
import { UserDatabase as Subscriber } from '../../op/subscribe/subscribe-notification';
import { Database as Updater } from 'src/abst/subscription/notifier';
import { GitHubUsers } from 'src/exp/github-user';

export type UpdateHandler = { handleUpdate: (users: GitHubUsers) => void };

export type Database = Subscriber &
  Unsubscriber &
  Updater & {
    onUpdate: (handler: UpdateHandler) => void;
  };
