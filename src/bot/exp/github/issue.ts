export type PartialIssue = Pick<Issue, "html_url" | "title" | "number">;

export interface Issue {
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
