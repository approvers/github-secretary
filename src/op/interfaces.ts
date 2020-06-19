import { UserDatabase as Subscriber } from "./subscribe/subscribe-notification.ts";
import { UserDatabase as Unsubscriber } from "./subscribe/unsubscribe-notification.ts";
import { UserDatabase as Fetcher } from "./subscribe/mark-as-read.ts";

export type UserDatabase = Subscriber & Unsubscriber & Fetcher;

import { Query as IssueQuery } from "./bring/issue.ts";
import { Query as PRQuery } from "./bring/pr.ts";
import { Query as RepoQuery } from "./bring/repo.ts";
import { Query as MarkAsReadQuery } from "./subscribe/mark-as-read.ts";
import { Query as SubQuery } from "./subscribe/subscribe-notification.ts";

export type Query =
  & IssueQuery
  & PRQuery
  & RepoQuery
  & MarkAsReadQuery
  & SubQuery;

import { Database as Updater } from "../skin/notifier.ts";
import { GitHubUsers } from "../exp/github-user.ts";

export type UpdateHandler = {
  handleUpdate: (users: Readonly<GitHubUsers>) => Promise<void>;
};

export type SubscriptionDatabase = Updater & {
  onUpdate: (handler: UpdateHandler) => void;
};
