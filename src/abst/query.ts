import { Query as IssueQuery } from '../op/bring/issue';
import { Query as PRQuery } from '../op/bring/pr';
import { Query as RepoQuery } from '../op/bring/repo';
import { Query as MarkAsReadQuery } from '../op/subscribe/mark-as-read';
import { Query as SubQuery } from '../op/subscribe/subscribe-notification';

export type Query = IssueQuery & PRQuery & RepoQuery & MarkAsReadQuery & SubQuery;
