import type { Branch, Issue, PullRequest, Repository } from "./bring.js";
import type { GitHubUser } from "../../model/github-user.js";
import type { NotificationId } from "../../model/github-notification.js";

export interface Api {
  fetchRepo: (owner: string, repoName: string) => Promise<Repository>;
}

export interface IssueApi extends Api {
  fetchIssues: (owner: string, repoName: string) => Promise<Issue[]>;
  fetchAnIssue: (
    owner: string,
    repoName: string,
    dst: string,
  ) => Promise<Issue>;
}

export interface PullApi extends Api {
  fetchPullRequests: (
    owner: string,
    repoName: string,
  ) => Promise<PullRequest[]>;
  fetchAPullRequest: (
    owner: string,
    repoName: string,
    dst: string,
  ) => Promise<PullRequest>;
}

export interface BranchApi extends Api {
  fetchBranches: (owner: string, repoName: string) => Promise<Branch[]>;
  fetchABranch: (
    owner: string,
    repoName: string,
    branchName: string,
  ) => Promise<Branch>;
}

export interface NotificationApi {
  markAsRead(
    user: GitHubUser,
    notificationId: NotificationId,
  ): Promise<boolean>;
}

export interface UserApi {
  getGitHubUser(userName: string, token: string): Promise<GitHubUser>;
}

export type AllApi = IssueApi & PullApi & BranchApi & NotificationApi & UserApi;
