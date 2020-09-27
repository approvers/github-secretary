import { CommandProcessor, connectProcessors } from "../../abst/connector";
import { EmbedFieldData, MessageEmbed } from "discord.js";
import { Analecta } from "../../exp/analecta";
import { Message } from "../../abst/message";
import { Repository } from "./repo";
import { colorFromState } from "../../exp/state-color";
import { omitBody } from "../../exp/omit";
import { replyFailure } from "../../abst/reply-failure";

export interface PartialPullRequest {
  // eslint-disable-next-line camelcase
  html_url: string;
  title: string;
  number: string;
}

export interface PullRequest {
  state: string;
  title: string;
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
  fetchPullRequests: (
    owner: string,
    repoName: string,
  ) => Promise<PartialPullRequest[]>;
  fetchAPullRequest: (
    owner: string,
    repoName: string,
    dst: string,
  ) => Promise<PullRequest>;
};

// eslint-disable-next-line max-len
const ghPattern = /^\/ghp\s+(?<first>[^/]+)(?:\/(?<second>[^/]+)(?:\/(?<third>[^/]+))?)?$/u;

const numbersPattern = /^[1-9][0-9]*$/u;

const genSubCommands = (
  { groups }: RegExpMatchArray,
  query: Query,
): CommandProcessor[] =>
  [
    externalPR(groups?.first)(groups?.second, groups?.third),
    internalPR(groups?.first, groups?.second),
    externalPRList(groups?.first)(groups?.second),
    internalPRList(groups?.first),
  ]
    .map((processor) => processor(query))
    .concat(replyFailure);

export const bringPR = (query: Query) => async (
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

const externalPRList = (owner?: string) => (repo?: string) => (
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

    const fields: EmbedFieldData[] = (
      await query.fetchPullRequests(owner, repo)
    ).map(linkField);
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
        .setFooter(analecta.EnumPR)
        .addFields(fields),
    );
  } catch (_e) {
    return false;
  }

  return true;
};

const internalPRList = externalPRList("approvers");

const externalPR = (owner?: string) => (repo?: string, dst?: string) => (
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
      html_url: linkUrl,
      user: { avatar_url: iconUrl, login },
    } = await query.fetchAPullRequest(owner, repo, dst);

    const color = colorFromState(state);
    const description = body ? omitBody(body) : "";
    await msg.sendEmbed(
      new MessageEmbed()
        .setColor(color)
        .setAuthor(login, iconUrl)
        .setURL(linkUrl)
        .setDescription(description)
        .setTitle(title)
        .setFooter(analecta.BringPR),
    );
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
