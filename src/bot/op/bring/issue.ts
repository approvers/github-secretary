import { CommandProcessor, connectProcessors } from "../../abst/connector";
import { EmbedFieldData, MessageEmbed } from "discord.js";
import type { Analecta } from "../../exp/analecta";
import type { Message } from "../../abst/message";
import type { Repository } from "./repo";
import { colorFromState } from "../../exp/state-color";
import { omitBody } from "../../exp/omit";
import { replyFailure } from "../../abst/reply-failure";

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

export type Query = {
  fetchRepo: (owner: string, repoName: string) => Promise<Repository>;
  fetchIssues: (owner: string, repoName: string) => Promise<PartialIssue[]>;
  fetchAnIssue: (
    owner: string,
    repoName: string,
    dst: string,
  ) => Promise<Issue>;
};

// eslint-disable-next-line max-len
const ghPattern = /^\/ghi\s+(?<first>[^/]+)(?:\/(?<second>[^/]+)(?:\/(?<third>[^/]+))?)?\s*$/u;

const numbersPattern = /^[1-9][0-9]*$/u;

const genSubCommands = (
  { groups }: RegExpMatchArray,
  query: Query,
): CommandProcessor[] =>
  [
    externalIssue(groups?.first)(groups?.second, groups?.third),
    internalIssue(groups?.first, groups?.second),
    externalIssueList(groups?.first)(groups?.second),
    internalIssueList(groups?.first),
  ]
    .map((processor) => processor(query))
    .concat(replyFailure);

export const bringIssue = (query: Query) => async (
  analecta: Analecta,
  msg: Message,
): Promise<boolean> => {
  const matches = await msg.matchCommand(ghPattern);
  if (matches === null) {
    return false;
  }

  return msg.withTyping(() =>
    connectProcessors(genSubCommands(matches, query))(analecta, msg),
  );
};

const externalIssueList = (owner?: string) => (repo?: string) => (
  query: Query,
): CommandProcessor => async (analecta: Analecta, msg: Message) => {
  if (!owner || !repo) {
    return false;
  }
  try {
    const {
      name: repoName,
      html_url: linkUrl,
      owner: { avatar_url: iconUrl, html_url: ownerUrl, login },
    } = await query.fetchRepo(owner, repo);

    const fields: EmbedFieldData[] = (await query.fetchIssues(owner, repo)).map(
      linkField,
    );
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
        .setFooter(analecta.EnumIssue)
        .addFields(fields),
    );
  } catch (_e) {
    return false;
  }
  return true;
};

const internalIssueList = externalIssueList("approvers");

const externalIssue = (owner?: string) => (repo?: string, dst?: string) => (
  query: Query,
): CommandProcessor => async (analecta: Analecta, msg: Message) => {
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

    await msg.sendEmbed(
      new MessageEmbed()
        .setColor(color)
        .setAuthor(login, iconUrl)
        .setURL(htmlUrl)
        .setDescription(description)
        .setTitle(title)
        .setFooter(analecta.BringIssue),
    );
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
