import { Query as IssueQuery } from '../op/bring/issue';
import { Query as PRQuery } from '../op/bring/pr';
import { Query as RepoQuery } from '../op/bring/repo';

export type Query = IssueQuery & PRQuery & RepoQuery;
