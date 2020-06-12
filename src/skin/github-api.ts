import { Query } from 'src/abst/query';
import fetch from 'node-fetch';

export class GitHubApi implements Query {
  async fetchRepo(
    owner: string,
    repoName: string,
  ): Promise<{
    name: string;
    description?: string;
    html_url: string;
    owner: { avatar_url: string; html_url: string; login: string };
  }> {
    const repoInfoApiUrl = `https://api.github.com/repos/${owner}/${repoName}`;
    const infoRes = await (await fetch(repoInfoApiUrl)).json();
    if (infoRes.message === 'Not Found') {
      throw new Error('not found the repositpory');
    }
    return infoRes;
  }

  async fetchIssues(
    owner: string,
    repoName: string,
  ): Promise<{ html_url: string; title: string; number: string }[]> {
    const apiUrl = `https://api.github.com/repos/${owner}/${repoName}/issues`;
    const res = await (await fetch(apiUrl)).json();
    if (res.message === 'Not Found') {
      throw new Error('not found the repositpory');
    }
    return res;
  }

  async fetchAnIssue(
    owner: string,
    repoName: string,
    dst: string,
  ): Promise<{
    state: string;
    title: string;
    body?: string;
    html_url: string;
    user: { avatar_url: string; login: string };
  }> {
    const apiUrl = `https://api.github.com/repos/${owner}/${repoName}/issues/${dst}`;
    const res = await (await fetch(apiUrl)).json();
    if (res.message === 'Not Found') {
      throw new Error('not found the issue');
    }
    return res;
  }

  async fetchPullRequests(
    owner: string,
    repoName: string,
  ): Promise<{ html_url: string; title: string; number: string }[]> {
    const apiUrl = `https://api.github.com/repos/${owner}/${repoName}/pulls`;
    const res = await (await fetch(apiUrl)).json();
    if (res.message === 'Not Found') {
      throw new Error('not found the repositpory');
    }
    return res;
  }

  async fetchAPullRequest(
    owner: string,
    repoName: string,
    dst: string,
  ): Promise<{
    state: string;
    title: string;
    body?: string | undefined;
    html_url: string;
    user: { avatar_url: string; login: string };
  }> {
    const apiUrl = `https://api.github.com/repos/${owner}/${repoName}/pulls/${dst}`;
    const res = await (await fetch(apiUrl)).json();
    if (res.message === 'Not Found') {
      throw new Error('not found the pull request');
    }
    return res;
  }
}
