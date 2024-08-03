import {
  CommandProcessor,
  connectProcessors,
} from "../../../runners/connector.js";
import type { EmbedPage, Message } from "../../../model/message.js";
import type { Analecta } from "../../../model/analecta.js";
import type { PullApi } from "../api.js";
import { colorFromState } from "../../../model/state-color.js";
import { omitBody } from "../../../model/omit.js";
import { replyFailure } from "../../../services/reply-failure.js";

export type PartialPullRequest = Pick<
  PullRequest,
  "html_url" | "title" | "number"
>;

export interface PullRequest {
  state: string;
  title: string;
  number: number;
  body?: string;
  html_url: string;
  user: {
    avatar_url: string;
    login: string;
  };
}

const ghPattern =
  /^\/ghp\s+(?<first>[^/]+)(?:\/(?<second>[^/]+)(?:\/(?<third>[^/]+))?)?\s*$/u;

const numbersPattern = /^[1-9][0-9]*$/u;

const genSubCommands = (
  { groups }: RegExpMatchArray,
  query: PullApi,
  analecta: Analecta,
): CommandProcessor<Message>[] =>
  [
    externalPR(groups?.first)(groups?.second, groups?.third),
    internalPR(groups?.first, groups?.second),
    externalPRList(groups?.first)(groups?.second),
    internalPRList(groups?.first),
  ]
    .map((processor) => processor(query, analecta))
    .concat(replyFailure(analecta));

export const bringPR =
  (query: PullApi, analecta: Analecta) =>
  async (msg: Message): Promise<boolean> => {
    const matches = await msg.matchCommand(ghPattern);
    if (matches === null) {
      return false;
    }

    return msg.withTyping(() =>
      connectProcessors(genSubCommands(matches, query, analecta))(msg),
    );
  };

const externalPRList =
  (owner?: string) =>
  (repo?: string) =>
  (query: PullApi, analecta: Analecta): CommandProcessor<Message> =>
  async (msg: Message) => {
    if (!owner || !repo) {
      return false;
    }
    try {
      const pages: EmbedPage[] = (
        await query.fetchPullRequests(owner, repo)
      ).map(makeEmbed);
      if (pages.length === 0) {
        await msg.reply(analecta.NothingToBring);
        return true;
      }

      await msg.sendPages(pages);
    } catch {
      return false;
    }

    return true;
  };

const internalPRList = externalPRList("approvers");

const externalPR =
  (owner?: string) =>
  (repo?: string, dst?: string) =>
  (query: PullApi, analecta: Analecta): CommandProcessor<Message> =>
  async (msg: Message) => {
    if (!owner || !repo || !dst || !numbersPattern.test(dst)) {
      return false;
    }

    try {
      const pr = await query.fetchAPullRequest(owner, repo, dst);
      await msg.sendEmbed({
        ...makeEmbed(pr),
        footer: analecta.BringPR,
      });
    } catch {
      return false;
    }

    return true;
  };

const internalPR = externalPR("approvers");

const makeEmbed = ({
  state,
  title,
  body,
  html_url: linkUrl,
  user: { avatar_url: iconUrl, login },
}: PullRequest) => ({
  author: {
    name: login,
    iconUrl,
  },
  color: colorFromState(state),
  description: body ? omitBody(body) : "",
  title,
  url: linkUrl,
});
