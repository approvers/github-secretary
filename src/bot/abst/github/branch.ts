export type PartialBranch = Pick<Branch, "name">;

export interface Branch {
  name: string;
  commit: {
    author: {
      // eslint-disable-next-line camelcase
      avatar_url: string;
      login: string;
    };
  };
  _links: {
    html: string;
  };
}
