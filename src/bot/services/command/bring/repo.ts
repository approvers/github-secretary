import {
  CommandProcessor,
  connectProcessors,
} from "../../../runners/connector.js";
import type { Analecta } from "src/bot/model/analecta.js";
import type { Api } from "src/bot/services/command/api.js";
import type { Message } from "../../../model/message.js";
import { replyFailure } from "../../reply-failure.js";

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

const ghPattern = /^\/ghr\s+(?<first>[^/]+)(?:\/(?<second>.+))?\s*$/u;

const genSubCommands = (
  { groups }: RegExpMatchArray,
  query: Api,
  analecta: Analecta,
): CommandProcessor<Message>[] =>
  [internalRepo(groups?.first), externalRepo(groups?.first)(groups?.second)]
    .map((processor) => processor(query, analecta))
    .concat(replyFailure(analecta));

export const bringRepo =
  (query: Api, analecta: Analecta) =>
  async (msg: Message): Promise<boolean> => {
    const matches = await msg.matchCommand(ghPattern);
    if (matches === null) {
      return false;
    }

    return msg.withTyping(() =>
      connectProcessors(genSubCommands(matches, query, analecta))(msg),
    );
  };

const externalRepo =
  (owner?: string) =>
  (repo?: string) =>
  (query: Api, analecta: Analecta): CommandProcessor<Message> =>
  async (msg: Message): Promise<boolean> => {
    if (!owner || !repo) {
      return false;
    }
    try {
      const {
        name,
        description,
        html_url: linkUrl,
        owner: { avatar_url: iconUrl, html_url: ownerUrl, login },
      } = await query.fetchRepo(owner, repo);

      await msg.sendEmbed({
        author: {
          name: login,
          iconUrl,
          url: ownerUrl,
        },
        url: linkUrl,
        description: description || "",
        title: name,
        footer: analecta.BringRepo,
      });
    } catch (_e) {
      return false;
    }

    return true;
  };

const internalRepo = externalRepo("approvers");
