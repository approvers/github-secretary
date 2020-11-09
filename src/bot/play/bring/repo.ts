import { CommandProcessor, connectProcessors } from "../../abst/connector";
import type { Analecta } from "../../exp/analecta";
import type { Message } from "../../abst/message";
import { MessageEmbed } from "discord.js";
import { replyFailure } from "../../abst/reply-failure";

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

export type Query = {
  fetchRepo: (owner: string, repoName: string) => Promise<Repository>;
};

const ghPattern = /^\/ghr\s+(?<first>[^/]+)(?:\/(?<second>.+))?\s*$/u;

const genSubCommands = (
  { groups }: RegExpMatchArray,
  query: Query,
): CommandProcessor[] =>
  [internalRepo(groups?.first), externalRepo(groups?.first)(groups?.second)]
    .map((processor) => processor(query))
    .concat(replyFailure);

export const bringRepo = (query: Query) => async (
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

const externalRepo = (owner?: string) => (repo?: string) => (
  query: Query,
): CommandProcessor => async (
  analecta: Analecta,
  msg: Message,
): Promise<boolean> => {
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

    await msg.sendEmbed(
      new MessageEmbed()
        .setAuthor(login, iconUrl, ownerUrl)
        .setURL(linkUrl)
        .setDescription(description || "")
        .setTitle(name)
        .setFooter(analecta.BringRepo),
    );
  } catch (_e) {
    return false;
  }

  return true;
};

const internalRepo = externalRepo("approvers");
