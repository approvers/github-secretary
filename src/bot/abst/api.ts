import type { Branch, PartialBranch } from "./github/branch";
import type { Issue, PartialIssue } from "./github/issue";
import type { PartialPullRequest, PullRequest } from "./github/pr";
import type { GitHubUser } from "../exp/github-user";
import type { NotificationId } from "../exp/github-notification";
import type { Repository } from "./github/repo";

export interface Api {
  fetchRepo: (owner: string, repoName: string) => Promise<Repository>;
}

export interface IssueApi extends Api {
  fetchIssues: (owner: string, repoName: string) => Promise<PartialIssue[]>;
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
  ) => Promise<PartialPullRequest[]>;
  fetchAPullRequest: (
    owner: string,
    repoName: string,
    dst: string,
  ) => Promise<PullRequest>;
}

export interface BranchApi extends Api {
  fetchBranches: (owner: string, repoName: string) => Promise<PartialBranch[]>;
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
