import fetch from "node-fetch";

import { Query } from "../op/interfaces";
import { GitHubUser } from "../exp/github-user";
import { NotificationId } from "../exp/github-notification";
import type { Repository } from "../op/bring/repo";
import { Issue, PartialIssue } from "../op/bring/issue";
import { PartialPullRequest, PullRequest } from "../op/bring/pr";
import { Branch, PartialBranch } from "../op/bring/branch";

export class GitHubApi implements Query {
  async fetchRepo(
    owner: string,
    repoName: string
  ): Promise<Repository> {
    const repoInfoApiUrl = `https://api.github.com/repos/${owner}/${repoName}`;
    const infoRes: unknown = await (await fetch(repoInfoApiUrl)).json();
    if (checkNotFound(infoRes)) {
      throw new Error("not found the repositpory");
    }
    return infoRes as Repository;
  }

  async fetchIssues(
    owner: string,
    repoName: string
  ): Promise<PartialIssue[]> {
    const apiUrl = `https://api.github.com/repos/${owner}/${repoName}/issues`;
    const res: unknown = await (await fetch(apiUrl)).json();
    if (checkNotFound(res)) {
      throw new Error("not found the repositpory");
    }
    return res as PartialIssue[];
  }

  async fetchAnIssue(
    owner: string,
    repoName: string,
    dst: string
  ): Promise<Issue> {
    const apiUrl = `https://api.github.com/repos/${owner}/${repoName}/issues/${dst}`;
    const res: unknown = await (await fetch(apiUrl)).json();
    if (checkNotFound(res)) {
      throw new Error("not found the issue");
    }
    return res as Issue;
  }

  async fetchPullRequests(
    owner: string,
    repoName: string
  ): Promise<PartialPullRequest[]> {
    const apiUrl = `https://api.github.com/repos/${owner}/${repoName}/pulls`;
    const res: unknown = await (await fetch(apiUrl)).json();
    if (checkNotFound(res)) {
      throw new Error("not found the repositpory");
    }
    return res as PartialPullRequest[];
  }

  async fetchAPullRequest(
    owner: string,
    repoName: string,
    dst: string
  ): Promise<PullRequest> {
    const apiUrl = `https://api.github.com/repos/${owner}/${repoName}/pulls/${dst}`;
    const res: unknown = await (await fetch(apiUrl)).json();
    if (checkNotFound(res)) {
      throw new Error("not found the pull request");
    }
    return res as PullRequest;
  }

  async fetchBranches(
    owner: string,
    repoName: string
  ): Promise<PartialBranch[]> {
    const apiUrl = `https://api.github.com/repos/${owner}/${repoName}/branches`;
    const res: unknown = await (await fetch(apiUrl)).json();
    if (checkNotFound(res)) {
      throw new Error("not found the branches");
    }
    return res as PartialBranch[];
  }

  async fetchABranch(
    owner: string,
    repoName: string,
    branchName: string
  ): Promise<Branch> {
    const apiUrl = `https://api.github.com/repos/${owner}/${repoName}/branches/${branchName}`;
    const res: unknown = await (await fetch(apiUrl)).json();
    if (checkNotFound(res)) {
      throw new Error("not found the branch");
    }
    return res as Branch;
  }

  async markAsRead(user: GitHubUser, notificationId: string): Promise<boolean> {
    const { userName, notificationToken } = user;
    const res = await fetch(
      `https://api.github.com/notifications/threads/${notificationId}`,
      {
        method: "PATCH",
        headers: {
          Authorization:
            `Basic ` +
            Buffer.from(`${userName}:${notificationToken}`).toString("base64"),
        },
      }
    );
    if (res.status !== 205) {
      return false;
    }
    return true;
  }

  async getGitHubUser(userName: string, token: string): Promise<GitHubUser> {
    const res = await fetch(`https://api.github.com/notifications`, {
      headers: {
        Authorization:
          `Basic ` + Buffer.from(`${userName}:${token}`).toString("base64"),
      },
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

function checkNotFound(infoRes: unknown) {
  return typeof infoRes === 'object' && infoRes != null && 'message' in infoRes && (infoRes as {message: unknown}).message === "Not Found";
}
