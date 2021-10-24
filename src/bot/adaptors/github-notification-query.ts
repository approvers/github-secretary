import fetch, { FetchError } from "node-fetch";
import { GitHubNotifications } from "../model/github-notification";
import { GitHubUser } from "../model/github-user";
import { Query } from "../services/notify";

export const notificationQuery: Query = {
  async fetchNotification({
    userName,
    notificationToken,
  }: GitHubUser): Promise<GitHubNotifications> {
    const base64 = Buffer.from(`${userName}:${notificationToken}`).toString(
      "base64",
    );
    try {
      const rawRes = await fetch("https://api.github.com/notifications", {
        headers: {
          Authorization: `Basic ${base64}`,
        },
      });
      if (!rawRes.ok) {
        return [];
      }
      return [...((await rawRes.json()) as unknown[])] as GitHubNotifications;
    } catch (err: unknown) {
      if (err instanceof FetchError) {
        return [];
      }
      throw err;
    }
  },
};
