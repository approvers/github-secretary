export type PartialPullRequest = Pick<
  PullRequest,
  "html_url" | "title" | "number"
>;

export interface PullRequest {
  state: string;
  title: string;
  number: number;
  body?: string;
  // eslint-disable-next-line camelcase
  html_url: string;
  user: {
    // eslint-disable-next-line camelcase
    avatar_url: string;
    login: string;
  };
}
