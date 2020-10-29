import type {
  UserDatabase as Fetcher,
  Query as MarkAsReadQuery,
} from "./subscribe/mark-as-read";
import type {
  Query as SubQuery,
  UserDatabase as Subscriber,
} from "./subscribe/subscribe-notification";
import type { Query as BranchQuery } from "./bring/branch";
import type { DiscordId } from "../exp/discord-id";
import type { GitHubUser } from "../exp/github-user";
import type { Query as IssueQuery } from "./bring/issue";
import type { Query as PRQuery } from "./bring/pr";
import type { Query as RepoQuery } from "./bring/repo";
import type { UserDatabase as Uns } from "./subscribe/unsubscribe-notification";
import type { Database as Updater } from "../skin/notifier";

export type UserDatabase = Subscriber & Uns & Fetcher;

export type Query = IssueQuery &
  PRQuery &
  BranchQuery &
  RepoQuery &
  MarkAsReadQuery &
  SubQuery;

export type UpdateHandler = {
  handleUpdate: (
    discordId: DiscordId,
    user: Readonly<GitHubUser>,
  ) => Promise<void>;
};

export type SubscriptionDatabase = Updater & {
  onUpdate: (handler: UpdateHandler) => void;
};
