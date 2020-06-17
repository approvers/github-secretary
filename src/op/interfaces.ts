import { UserDatabase as Subscriber } from './subscribe/subscribe-notification';
import { UserDatabase as Unsubscriber } from './subscribe/unsubscribe-notification';
import { UserDatabase as Fetcher } from './subscribe/mark-as-read';

export type UserDatabase = Subscriber & Unsubscriber & Fetcher;

import { Query as IssueQuery } from './bring/issue';
import { Query as PRQuery } from './bring/pr';
import { Query as RepoQuery } from './bring/repo';
import { Query as MarkAsReadQuery } from './subscribe/mark-as-read';
import { Query as SubQuery } from './subscribe/subscribe-notification';

export type Query = IssueQuery & PRQuery & RepoQuery & MarkAsReadQuery & SubQuery;
