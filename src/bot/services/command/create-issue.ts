import {
  CommandProcessor,
  connectProcessors,
} from "../../runners/connector.js";
import type { Analecta } from "../../model/analecta.js";
import type { Api } from "./api.js";
import type { Message } from "../command.js";
import { replyFailure } from "../reply-failure.js";

const ghPattern = /^\/ghni\s+(?<first>[^/]+)(?:\/(?<second>[^/]+))?\s*$/u;

const genSubCommands = (
  { groups }: RegExpMatchArray,
  api: Api,
  analecta: Analecta,
): CommandProcessor<Message>[] =>
  [externalIssue(groups?.first)(groups?.second), internalIssue(groups?.first)]
    .map((processor) => processor(api, analecta))
    .concat(replyFailure(analecta));

export const createIssue =
  (api: Api, analecta: Analecta) =>
  async (msg: Message): Promise<boolean> => {
    const matches = await msg.matchCommand(ghPattern);
    if (matches === null) {
      return false;
    }
    return msg.withTyping(() =>
      connectProcessors(genSubCommands(matches, api, analecta))(msg),
    );
  };

const externalIssue =
  (owner?: string) =>
  (repo?: string) =>
  (api: Api, analecta: Analecta) =>
  async (msg: Message) => {
    if (!owner || !repo) {
      return false;
    }
    try {
      await api.fetchRepo(owner, repo);
      await msg.sendEmbed({
        title: `https://github.com/${owner}/${repo}/issues/new`,
        url: `https://github.com/${owner}/${repo}/issues/new`,
        footer: analecta.CreatingIssue,
      });
    } catch {
      return false;
    }
    return true;
  };

const internalIssue = externalIssue("approvers");
