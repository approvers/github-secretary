import { CommandProcessor, connectProcessors } from "../../abst/connector";
import { EmbedFieldData, MessageEmbed } from "discord.js";
import type { Analecta } from "../../exp/analecta";
import type { BranchApi } from "src/bot/abst/api";
import type { Message } from "../../abst/message";
import type { PartialBranch } from "src/bot/abst/github/branch";
import { colorFromState } from "../../exp/state-color";
import { replyFailure } from "../../abst/reply-failure";

const ghPattern =
  // eslint-disable-next-line max-len
  /^\/ghb\s+(?<first>[^/\s]+)(?:\/(?<second>[^/\s]+))?(?:\s+(?<third>.+))?\s*$/u;

const genSubCommands = (
  { groups }: RegExpMatchArray,
  query: BranchApi,
): CommandProcessor[] =>
  [
    externalBranch(groups?.first)(groups?.second, groups?.third),
    internalBranch(groups?.first, groups?.third),
    externalBranchList(groups?.first)(groups?.second),
    internalBranchList(groups?.first),
  ]
    .map((processor) => processor(query))
    .concat(replyFailure);

export const bringBranch =
  (query: BranchApi) =>
  async (analecta: Analecta, msg: Message): Promise<boolean> => {
    const matches = await msg.matchCommand(ghPattern);
    if (matches === null) {
      return false;
    }

    return msg.withTyping(() =>
      connectProcessors(genSubCommands(matches, query))(analecta, msg),
    );
  };

const externalBranchList =
  (owner?: string) =>
  (repo?: string) =>
  (query: BranchApi): CommandProcessor =>
  async (analecta: Analecta, msg: Message) => {
    if (!owner || !repo) {
      return false;
    }
    try {
      const {
        name: repoName,
        html_url: linkUrl,
        owner: { avatar_url: iconUrl, html_url: ownerUrl, login },
      } = await query.fetchRepo(owner, repo);

      const fields: EmbedFieldData[] = (
        await query.fetchBranches(owner, repo)
      ).map(linkField(login, repoName));
      if (fields.length === 0) {
        await msg.reply(analecta.NothingToBring);
        return true;
      }

      await msg.sendEmbed(
        new MessageEmbed()
          .setColor(colorFromState("open"))
          .setAuthor(login, iconUrl, ownerUrl)
          .setURL(linkUrl)
          .setTitle(repoName)
          .setFooter(analecta.EnumBranch)
          .addFields(fields),
      );
    } catch (_e) {
      return false;
    }

    return true;
  };

const internalBranchList = externalBranchList("approvers");

const externalBranch =
  (owner?: string) =>
  (repo?: string, branch?: string) =>
  (query: BranchApi): CommandProcessor =>
  async (analecta: Analecta, msg: Message) => {
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

      await msg.sendEmbed(
        new MessageEmbed()
          .setColor(colorFromState("open"))
          .setAuthor(
            login,
            iconUrl,
            `https://github.com/${login}`.toLowerCase(),
          )
          .setURL(html)
          .setTitle(name)
          .setFooter(analecta.BringBranch),
      );
    } catch (_e) {
      return false;
    }

    return true;
  };

const internalBranch = externalBranch("approvers");

const linkField =
  (login: string, repo: string) =>
  (
    { name }: PartialBranch,
    index: number,
  ): { name: string; value: string } => ({
    name: (index + 1).toString().padStart(2, "0"),
    value: linkMarkdown(name, login, repo),
  });

const linkMarkdown = (name: string, login: string, repo: string): string =>
  `[${name}](https://github.com/${login}/${repo}/tree/${name})`.toLowerCase();
