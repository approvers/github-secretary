import {
  UserDatabase as Fetcher,
  Query as MarkAsReadQuery,
} from "./subscribe/mark-as-read";
import {
  Query as SubQuery,
  UserDatabase as Subscriber,
} from "./subscribe/subscribe-notification";
import { Query as BranchQuery } from "./bring/branch";
import { GitHubUsers } from "../exp/github-user";
import { Query as IssueQuery } from "./bring/issue";
import { Query as PRQuery } from "./bring/pr";
import { Query as RepoQuery } from "./bring/repo";
import { UserDatabase as Unsub } from "./subscribe/unsubscribe-notification";
import { Database as Updater } from "../skin/notifier";

export type UserDatabase = Subscriber & Unsub & Fetcher;

export type Query = IssueQuery &
  PRQuery &
  BranchQuery &
  RepoQuery &
  MarkAsReadQuery &
  SubQuery;

export type UpdateHandler = {
  handleUpdate: (users: Readonly<GitHubUsers>) => Promise<void>;
};

export type SubscriptionDatabase = Updater & {
  onUpdate: (handler: UpdateHandler) => void;
};
