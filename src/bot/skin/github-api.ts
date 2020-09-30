import type { Branch, PartialBranch } from "../op/bring/branch";
import type { Issue, PartialIssue } from "../op/bring/issue";
import type { PartialPullRequest, PullRequest } from "../op/bring/pr";
import type { GitHubUser } from "../exp/github-user";
import type { NotificationId } from "../exp/github-notification";
import type { Query } from "../op/interfaces";
import type { Repository } from "../op/bring/repo";
import fetch from "node-fetch";

const apiRoot = "https://api.github.com";

export class GitHubApi implements Query {
  async fetchRepo(owner: string, repoName: string): Promise<Repository> {
    const repoInfoApiUrl = `${apiRoot}/repos/${owner}/${repoName}`;
    const infoRes: unknown = await (await fetch(repoInfoApiUrl)).json();
    if (checkNotFound(infoRes)) {
      throw new Error("not found the repositpory");
    }
    return infoRes as Repository;
  }

  async fetchIssues(owner: string, repoName: string): Promise<PartialIssue[]> {
    const apiUrl = `${apiRoot}/repos/${owner}/${repoName}/issues`;
    const res: unknown = await (await fetch(apiUrl)).json();
    if (checkNotFound(res)) {
      throw new Error("not found the repositpory");
    }
    return res as PartialIssue[];
  }

  async fetchAnIssue(
    owner: string,
    repoName: string,
    dst: string,
  ): Promise<Issue> {
    const apiUrl = `${apiRoot}/repos/${owner}/${repoName}/issues/${dst}`;
    const res: unknown = await (await fetch(apiUrl)).json();
    if (checkNotFound(res)) {
      throw new Error("not found the issue");
    }
    return res as Issue;
  }

  async fetchPullRequests(
    owner: string,
    repoName: string,
  ): Promise<PartialPullRequest[]> {
    const apiUrl = `${apiRoot}/repos/${owner}/${repoName}/pulls`;
    const res: unknown = await (await fetch(apiUrl)).json();
    if (checkNotFound(res)) {
      throw new Error("not found the repositpory");
    }
    return res as PartialPullRequest[];
  }

  async fetchAPullRequest(
    owner: string,
    repoName: string,
    dst: string,
  ): Promise<PullRequest> {
    const apiUrl = `${apiRoot}/repos/${owner}/${repoName}/pulls/${dst}`;
    const res: unknown = await (await fetch(apiUrl)).json();
    if (checkNotFound(res)) {
      throw new Error("not found the pull request");
    }
    return res as PullRequest;
  }

  async fetchBranches(
    owner: string,
    repoName: string,
  ): Promise<PartialBranch[]> {
    const apiUrl = `${apiRoot}/repos/${owner}/${repoName}/branches`;
    const res: unknown = await (await fetch(apiUrl)).json();
    if (checkNotFound(res)) {
      throw new Error("not found the branches");
    }
    return res as PartialBranch[];
  }

  async fetchABranch(
    owner: string,
    repo: string,
    branchName: string,
  ): Promise<Branch> {
    const apiUrl = `${apiRoot}/repos/${owner}/${repo}/branches/${branchName}`;
    const res: unknown = await (await fetch(apiUrl)).json();
    if (checkNotFound(res)) {
      throw new Error("not found the branch");
    }
    return res as Branch;
  }

  async markAsRead(user: GitHubUser, notificationId: string): Promise<boolean> {
    const { userName, notificationToken } = user;
    const res = await fetch(
      `${apiRoot}/notifications/threads/${notificationId}`,
      {
        method: "PATCH",
        headers: makeHeaders(userName, notificationToken),
      },
    );
    const resetContentCode = 205;
    if (res.status !== resetContentCode) {
      return false;
    }
    return true;
  }

  async getGitHubUser(userName: string, token: string): Promise<GitHubUser> {
    const res = await fetch(`${apiRoot}/notifications`, {
      headers: makeHeaders(userName, token),
    });
    if (!res.ok) {
      throw new Error("invalid token");
    }
    return {
      userName,
      notificationToken: token,
      currentNotificationIds: [] as NotificationId[],
    } as GitHubUser;
  }
}

const checkNotFound = (infoRes: unknown) =>
  typeof infoRes === "object" &&
  infoRes !== null &&
  "message" in infoRes &&
  (infoRes as { message: unknown }).message === "Not Found";

const makeHeaders = (userName: string, token: string) => ({
  Authorization: `Basic ${Buffer.from(`${userName}:${token}`).toString(
    "base64",
  )}`,
});
