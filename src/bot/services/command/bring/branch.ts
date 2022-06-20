import {
  CommandProcessor,
  connectProcessors,
} from "../../../runners/connector.js";
import type { EmbedMessageField, Message } from "../../../model/message.js";
import type { Analecta } from "../../../model/analecta.js";
import type { BranchApi } from "src/bot/services/command/api.js";
import { colorFromState } from "../../../model/state-color.js";
import { replyFailure } from "../../../services/reply-failure.js";

export interface Branch {
  name: string;
  commit: {
    author: {
      // eslint-disable-next-line camelcase
      avatar_url: string;
      login: string;
    };
  };
  _links: {
    html: string;
  };
}

const ghPattern =
  // eslint-disable-next-line max-len
  /^\/ghb\s+(?<first>[^/\s]+)(?:\/(?<second>[^/\s]+))?(?:\s+(?<third>.+))?\s*$/u;

const genSubCommands = (
  { groups }: RegExpMatchArray,
  query: BranchApi,
  analecta: Analecta,
): CommandProcessor<Message>[] =>
  [
    externalBranch(groups?.first)(groups?.second, groups?.third),
    internalBranch(groups?.first, groups?.third),
    externalBranchList(groups?.first)(groups?.second),
    internalBranchList(groups?.first),
  ]
    .map((processor) => processor(query, analecta))
    .concat(replyFailure(analecta));

export const bringBranch =
  (query: BranchApi, analecta: Analecta) =>
  async (msg: Message): Promise<boolean> => {
    const matches = await msg.matchCommand(ghPattern);
    if (matches === null) {
      return false;
    }

    return msg.withTyping(() =>
      connectProcessors(genSubCommands(matches, query, analecta))(msg),
    );
  };

const externalBranchList =
  (owner?: string) =>
  (repo?: string) =>
  (query: BranchApi, analecta: Analecta): CommandProcessor<Message> =>
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
        await query.fetchBranches(owner, repo)
      ).map(linkField(login, repoName));
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
        fields,
        footer: analecta.EnumBranch,
        title: repoName,
        url: linkUrl,
      });
    } catch (_e) {
      return false;
    }

    return true;
  };

const internalBranchList = externalBranchList("approvers");

const externalBranch =
  (owner?: string) =>
  (repo?: string, branch?: string) =>
  (query: BranchApi, analecta: Analecta): CommandProcessor<Message> =>
  async (msg: Message) => {
    if (!owner || !repo || !branch) {
      return false;
    }
    try {
      const {
        name,
        commit: {
          author: { avatar_url: iconUrl, login },
        },
        _links: { html },
      } = await query.fetchABranch(owner, repo, branch);

      await msg.sendEmbed({
        author: {
          name: login,
          iconUrl,
          url: `https://github.com/${login}`.toLowerCase(),
        },
        color: colorFromState("open"),
        footer: analecta.BringBranch,
        title: name,
        url: html,
      });
    } catch (_e) {
      return false;
    }

    return true;
  };

const internalBranch = externalBranch("approvers");

const linkField =
  (login: string, repo: string) =>
  ({ name }: Branch, index: number): { name: string; value: string } => ({
    name: (index + 1).toString().padStart(2, "0"),
    value: linkMarkdown(name, login, repo),
  });

const linkMarkdown = (name: string, login: string, repo: string): string =>
  `[${name}](https://github.com/${login}/${repo}/tree/${name})`.toLowerCase();
