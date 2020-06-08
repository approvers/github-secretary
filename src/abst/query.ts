import { Query as IssueQuery } from '../op/bring/issue';
import { Query as PRQuery } from '../op/bring/pr';

export type Query = IssueQuery & PRQuery;
