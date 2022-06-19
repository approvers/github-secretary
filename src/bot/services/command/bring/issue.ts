import {
  CommandProcessor,
  connectProcessors,
} from "../../../runners/connector.js";
import type { EmbedMessageField, Message } from "../../../model/message.js";
import type { Analecta } from "src/bot/model/analecta.js";
import type { IssueApi } from "src/bot/services/command/api.js";
import { colorFromState } from "../../../model/state-color.js";
import { omitBody } from "../../../model/omit.js";
import { replyFailure } from "../../reply-failure.js";

export type PartialIssue = Pick<Issue, "html_url" | "title" | "number">;

export interface Issue {
  state: string;
  title: string;
  number: number;
  body?: string;
  // eslint-disable-next-line camelcase
  html_url: string;
  user: {
    // eslint-disable-next-line camelcase
    avatar_url: string;
    login: string;
  };
}

// eslint-disable-next-line max-len
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
      const {
        name: repoName,
        html_url: linkUrl,
        owner: { avatar_url: iconUrl, html_url: ownerUrl, login },
      } = await query.fetchRepo(owner, repo);

      const fields: EmbedMessageField[] = (
        await query.fetchIssues(owner, repo)
      ).map(linkField);
      if (fields.length === 0) {
        await msg.reply(analecta.NothingToBring);
        return true;
      }

      await msg.sendEmbed({
        author: {
          name: login,
          iconUrl,
          url: ownerUrl,
        },
        color: colorFromState("open"),
        fields,
        footer: analecta.EnumIssue,
        title: repoName,
        url: linkUrl,
      });
    } catch (_e) {
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
      const {
        state,
        title,
        body,
        html_url: htmlUrl,
        user: { avatar_url: iconUrl, login },
      } = await query.fetchAnIssue(owner, repo, dst);

      const color = colorFromState(state);
      const description = body ? omitBody(body) : "";

      await msg.sendEmbed({
        author: {
          name: login,
          iconUrl,
        },
        color,
        description,
        footer: analecta.BringIssue,
        title,
        url: htmlUrl,
      });
    } catch (_e) {
      return false;
    }

    return true;
  };

const internalIssue = externalIssue("approvers");

const linkField = ({
  html_url: htmlUrl,
  title,
  number,
}: PartialIssue): { name: string; value: string } => ({
  name: `#${number}`,
  value: `[${title}](${htmlUrl})`,
});
