export interface Repository {
  name: string;
  description?: string;
  // eslint-disable-next-line camelcase
  html_url: string;
  owner: {
    // eslint-disable-next-line camelcase
    avatar_url: string;
    // eslint-disable-next-line camelcase
    html_url: string;
    login: string;
  };
}
