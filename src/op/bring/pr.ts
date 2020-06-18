import { MessageEmbed, EmbedFieldData } from 'discord.js';

import { Analecta } from '../../exp/analecta';
import { colorFromState } from '../../exp/state-color';
import { replyFailure } from '../../abst/reply-failure';
import { CommandProcessor, connectProcessors } from '../../abst/connector';
import { omitBody } from '../../exp/omit';
import { Message } from '../../abst/message';

export type Query = {
  fetchRepo: (
    owner: string,
    repoName: string,
  ) => Promise<{
    name: string;
    html_url: string;
    owner: { avatar_url: string; login: string };
  }>;
  fetchPullRequests: (
    owner: string,
    repoName: string,
  ) => Promise<
    {
      html_url: string;
      title: string;
      number: string;
    }[]
  >;
  fetchAPullRequest: (
    owner: string,
    repoName: string,
    dst: string,
  ) => Promise<{
    state: string;
    title: string;
    body?: string;
    html_url: string;
    user: { avatar_url: string; login: string };
  }>;
};

const ghPattern = /^\/ghp\s+([^/]+)(\/([^/]+)(\/([^/]+))?)?$/;
const numbersPattern = /^[1-9][0-9]*$/;

const genSubCommands = (matches: RegExpMatchArray, query: Query): CommandProcessor[] =>
  [
    externalPR(matches[1])(matches[3], matches[5]),
    internalPR(matches[1], matches[3]),
    externalPRList(matches[1])(matches[3]),
    internalPRList(matches[1]),
  ]
    .map((e) => e(query))
    .concat(replyFailure);

export const bringPR = (query: Query) => async (
  analecta: Analecta,
  msg: Message,
): Promise<boolean> => {
  const matches = await msg.matchCommand(ghPattern);
  if (matches == null) {
    return false;
  }

  return msg.withTyping(() =>
    connectProcessors(genSubCommands(matches, query))(analecta, msg).catch((e) => {
      replyFailure(analecta, msg);
      throw e;
    }),
  );
};

const externalPRList = (owner: string) => (repo: string) => (
  query: Query,
): CommandProcessor => async (analecta: Analecta, msg: Message) => {
  const {
    name: repoName,
    html_url,
    owner: { avatar_url, login },
  } = await query.fetchRepo(owner, repo);

  const fields: EmbedFieldData[] = (await query.fetchPullRequests(owner, repo)).map(
    ({ html_url, title, number }) => ({
      name: `#${number}`,
      value: `[${title}](${html_url})`,
    }),
  );
  if (fields.length <= 0) {
    await msg.reply(analecta.NothingToBring);
    return true;
  }

  await msg.sendEmbed(
    new MessageEmbed()
      .setColor(colorFromState('open'))
      .setAuthor(login, avatar_url, html_url)
      .setURL(html_url)
      .setTitle(repoName)
      .setFooter(analecta.EnumPR)
      .addFields(fields),
  );
  return true;
};

const internalPRList = externalPRList('approvers');

const externalPR = (owner: string) => (repo: string, dst: string) => (
  query: Query,
): CommandProcessor => async (analecta: Analecta, msg: Message) => {
  if (!numbersPattern.test(dst)) {
    return false;
  }

  const {
    state,
    title,
    body,
    html_url,
    user: { avatar_url, login },
  }: {
    state: string;
    title: string;
    body?: string;
    html_url: string;
    user: { avatar_url: string; login: string };
  } = await query.fetchAPullRequest(owner, repo, dst);

  const color = colorFromState(state);
  const description = body ? omitBody(body) : '';
  await msg.sendEmbed(
    new MessageEmbed()
      .setColor(color)
      .setAuthor(login, avatar_url)
      .setURL(html_url)
      .setDescription(description)
      .setTitle(title)
      .setFooter(analecta.BringPR),
  );

  return true;
};

const internalPR = externalPR('approvers');
