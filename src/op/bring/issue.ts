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
    owner: { avatar_url: string; html_url: string; login: string };
  }>;
  fetchIssues: (
    owner: string,
    repoName: string,
  ) => Promise<
    {
      html_url: string;
      title: string;
      number: string;
    }[]
  >;
  fetchAnIssue: (
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

const ghPattern = /^\/ghi\s+([^/]+)(\/([^/]+)(\/([^/]+))?)?$/;
const numbersPattern = /^[1-9][0-9]*$/;

const genSubCommands = (matches: RegExpMatchArray, query: Query): CommandProcessor[] =>
  [
    externalIssue(matches[1])(matches[3], matches[5]),
    internalIssue(matches[1], matches[3]),
    externalIssueList(matches[1])(matches[3]),
    internalIssueList(matches[1]),
  ]
    .map((e) => e(query))
    .concat(replyFailure);

export const bringIssue = (query: Query) => async (
  analecta: Analecta,
  msg: Message,
): Promise<boolean> => {
  const matches = await msg.matchCommand(ghPattern);
  if (matches == null) {
    return false;
  }

  return msg.withTyping(() =>
    connectProcessors(genSubCommands(matches, query))(analecta, msg).catch((e: unknown) => {
      replyFailure(analecta, msg);
      throw e;
    }),
  );
};

const externalIssueList = (owner: string) => (repo: string) => (
  query: Query,
): CommandProcessor => async (analecta: Analecta, msg: Message) => {
  const {
    name: repoName,
    html_url,
    owner: { avatar_url, html_url: owner_url, login },
  } = await query.fetchRepo(owner, repo);

  const fields: EmbedFieldData[] = (await query.fetchIssues(owner, repo)).map(
    ({ html_url, title, number }) => ({
      name: `#${number}`,
      value: `[${title}](${html_url})`,
    }),
  );
  if (fields.length <= 0) {
    msg.reply(analecta.NothingToBring);
    return true;
  }

  msg.sendEmbed(
    new MessageEmbed()
      .setColor(colorFromState('open'))
      .setAuthor(login, avatar_url, owner_url)
      .setURL(html_url)
      .setTitle(repoName)
      .setFooter(analecta.EnumIssue)
      .addFields(fields),
  );
  return true;
};

const internalIssueList = externalIssueList('approvers');

const externalIssue = (owner: string) => (repo: string, dst: string) => (
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
  } = await query.fetchAnIssue(owner, repo, dst);

  const color = colorFromState(state);
  const description = body ? omitBody(body) : '';

  msg.sendEmbed(
    new MessageEmbed()
      .setColor(color)
      .setAuthor(login, avatar_url)
      .setURL(html_url)
      .setDescription(description)
      .setTitle(title)
      .setFooter(analecta.BringIssue),
  );

  return true;
};

const internalIssue = externalIssue('approvers');
