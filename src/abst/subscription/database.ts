import { UserDatabase as Unsubscriber } from '../../op/subscribe/unsubscribe-notification';
import { UserDatabase as Subscriber } from '../../op/subscribe/subscribe-notification';
import { Database as Updater } from '../../abst/subscription/notifier';
import { UserDatabase as Fetcher } from '../../op/subscribe/mark-as-read';
import { GitHubUsers } from '../../exp/github-user';

export type UpdateHandler = { handleUpdate: (users: Readonly<GitHubUsers>) => Promise<void> };

export type Database = Subscriber &
  Unsubscriber &
  Updater &
  Fetcher & {
    onUpdate: (handler: UpdateHandler) => void;
  };
