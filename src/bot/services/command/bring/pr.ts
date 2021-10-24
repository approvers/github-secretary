import {
  CommandProcessor,
  connectProcessors,
} from "../../../runners/connector";
import type { EmbedMessageField, Message } from "../../../model/message";
import type { Analecta } from "../../../model/analecta";
import type { PullApi } from "../api";
import { colorFromState } from "../../../model/state-color";
import { omitBody } from "../../../model/omit";
import { replyFailure } from "../../../services/reply-failure";

export type PartialPullRequest = Pick<
  PullRequest,
  "html_url" | "title" | "number"
>;

export interface PullRequest {
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
      const {
        name: repoName,
        html_url: linkUrl,
        owner: { avatar_url: iconUrl, html_url: ownerUrl, login },
      } = await query.fetchRepo(owner, repo);

      const fields: EmbedMessageField[] = (
        await query.fetchPullRequests(owner, repo)
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
        footer: analecta.EnumPR,
        title: repoName,
        url: linkUrl,
      });
    } catch (_e) {
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
      const {
        state,
        title,
        body,
        html_url: linkUrl,
        user: { avatar_url: iconUrl, login },
      } = await query.fetchAPullRequest(owner, repo, dst);

      const color = colorFromState(state);
      const description = body ? omitBody(body) : "";
      await msg.sendEmbed({
        author: {
          name: login,
          iconUrl,
        },
        color,
        description,
        footer: analecta.BringPR,
        title,
        url: linkUrl,
      });
    } catch (_e) {
      return false;
    }

    return true;
  };

const internalPR = externalPR("approvers");

const linkField = ({
  html_url: htmlUrl,
  title,
  number,
}: PartialPullRequest): { name: string; value: string } => ({
  name: `#${number}`,
  value: `[${title}](${htmlUrl})`,
});
