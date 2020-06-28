import { MessageEmbed } from 'discord.js';

import { Analecta } from '../../exp/analecta';
import { CommandProcessor, connectProcessors } from '../../abst/connector';
import { replyFailure } from '../../abst/reply-failure';
import { Message } from '../../abst/message';

export type Query = {
  fetchRepo: (
    owner: string,
    repoName: string,
  ) => Promise<{
    name: string;
    description?: string;
    html_url: string;
    owner: { avatar_url: string; html_url: string; login: string };
  }>;
};

const ghPattern = /^\/ghr\s+([^/]+)(\/(.+))?$/;

const genSubCommands = (matches: RegExpMatchArray, query: Query): CommandProcessor[] =>
  [internalRepo(matches[1]), externalRepo(matches[1])(matches[3])]
    .map((e) => e(query))
    .concat(replyFailure);

export const bringRepo = (query: Query) => async (
  analecta: Analecta,
  msg: Message,
): Promise<boolean> => {
  const matches = await msg.matchCommand(ghPattern);
  if (matches == null) {
    return false;
  }

  return msg.withTyping(() => connectProcessors(genSubCommands(matches, query))(analecta, msg));
};

const externalRepo = (owner: string) => (repo: string) => (
  query: Query,
): CommandProcessor => async (analecta: Analecta, msg: Message): Promise<boolean> => {
  try {
    const {
      name,
      description,
      html_url,
      owner: { avatar_url, html_url: owner_url, login },
    } = await query.fetchRepo(owner, repo);

    msg.sendEmbed(
      new MessageEmbed()
        .setAuthor(login, avatar_url, owner_url)
        .setURL(html_url)
        .setDescription(description || '')
        .setTitle(name)
        .setFooter(analecta.BringRepo),
    );
  } catch (_e) {
    /** @ignore */
    return false;
  }

  return true;
};

const internalRepo = externalRepo('approvers');
