import {
  CommandProcessor,
  connectProcessors,
} from "../../../runners/connector.js";
import type { EmbedPage, Message } from "../../../model/message.js";
import type { Analecta } from "src/bot/model/analecta.js";
import type { IssueApi } from "src/bot/services/command/api.js";
import { colorFromState } from "../../../model/state-color.js";
import { omitBody } from "../../../model/omit.js";
import { replyFailure } from "../../reply-failure.js";

export interface Issue {
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
  /^\/ghi\s+(?<first>[^/]+)(?:\/(?<second>[^/]+)(?:\/(?<third>[^/]+))?)?\s*$/u;

const numbersPattern = /^[1-9][0-9]*$/u;

const genSubCommands = (
  { groups }: RegExpMatchArray,
  query: IssueApi,
  analecta: Analecta,
): CommandProcessor<Message>[] =>
  [
    externalIssue(groups?.first)(groups?.second, groups?.third),
    internalIssue(groups?.first, groups?.second),
    externalIssueList(groups?.first)(groups?.second),
    internalIssueList(groups?.first),
  ]
    .map((processor) => processor(query, analecta))
    .concat(replyFailure(analecta));

export const bringIssue =
  (query: IssueApi, analecta: Analecta) =>
  async (msg: Message): Promise<boolean> => {
    const matches = await msg.matchCommand(ghPattern);
    if (matches === null) {
      return false;
    }

    return msg.withTyping(() =>
      connectProcessors(genSubCommands(matches, query, analecta))(msg),
    );
  };

const externalIssueList =
  (owner?: string) =>
  (repo?: string) =>
  (query: IssueApi, analecta: Analecta): CommandProcessor<Message> =>
  async (msg: Message) => {
    if (!owner || !repo) {
      return false;
    }
    try {
      const pages: EmbedPage[] = (await query.fetchIssues(owner, repo)).map(
        makeEmbed,
      );
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

const internalIssueList = externalIssueList("approvers");

const externalIssue =
  (owner?: string) =>
  (repo?: string, dst?: string) =>
  (query: IssueApi, analecta: Analecta): CommandProcessor<Message> =>
  async (msg: Message) => {
    if (!owner || !repo || !dst || !numbersPattern.test(dst)) {
      return false;
    }

    try {
      const issue = await query.fetchAnIssue(owner, repo, dst);
      await msg.sendEmbed({
        ...makeEmbed(issue),
        footer: analecta.BringIssue,
      });
    } catch {
      return false;
    }

    return true;
  };

const internalIssue = externalIssue("approvers");

const makeEmbed = ({
  state,
  title,
  body,
  html_url: htmlUrl,
  user: { avatar_url: iconUrl, login },
}: Issue): EmbedPage => ({
  author: {
    name: login,
    iconUrl,
  },
  color: colorFromState(state),
  description: body ? omitBody(body) : "",
  title,
  url: htmlUrl,
});
