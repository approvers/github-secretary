import { Analecta } from '../../exp/analecta';
import { Message, MessageEmbed } from 'discord.js';
import { CommandProcessor, connectProcessors } from '../../abst/connector';
import { replyFailure } from '../reply-failure';

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
  const content = msg.content.split('\n')[0];
  if (!ghPattern.test(content)) {
    return false;
  }

  const matches = content.match(ghPattern);
  if (matches == null) {
    return false;
  }

  msg.channel.startTyping();
  const res = await connectProcessors(genSubCommands(matches, query))(analecta, msg).catch((e) => {
    replyFailure(analecta, msg);
    msg.channel.stopTyping();
    throw e;
  });
  msg.channel.stopTyping();
  return res;
};

const externalRepo = (owner: string) => (repo: string) => (
  query: Query,
): CommandProcessor => async (analecta: Analecta, msg: Message): Promise<boolean> => {
  const {
    name,
    description,
    html_url,
    owner: { avatar_url, html_url: owner_url, login },
  } = await query.fetchRepo(owner, repo);

  msg.channel.send(
    new MessageEmbed()
      .setAuthor(login, avatar_url, owner_url)
      .setURL(html_url)
      .setDescription(description || '')
      .setTitle(name)
      .setFooter(analecta.BringRepo),
  );

  return true;
};

const internalRepo = externalRepo('approvers');
