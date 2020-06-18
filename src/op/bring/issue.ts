import { Analecta } from '../../exp/analecta.ts';
import { colorFromState } from '../../exp/state-color.ts';
import { replyFailure } from '../../abst/reply-failure.ts';
import { CommandProcessor, connectProcessors } from '../../abst/connector.ts';
import { omitBody } from '../../exp/omit.ts';
import { Message } from '../../abst/message.ts';
import { EmbedField, EmbedMessage } from '../../exp/embed-message.ts';

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

  const fields: EmbedField[] = (await query.fetchIssues(owner, repo)).map(
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
    new EmbedMessage()
      .color(colorFromState('open'))
      .author({ name: login, icon_url: avatar_url, url: owner_url })
      .url(html_url)
      .title(repoName)
      .footer({ text: analecta.EnumIssue })
      .fields(...fields),
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
    new EmbedMessage()
      .color(color)
      .author({ name: login, icon_url: avatar_url })
      .url(html_url)
      .description(description)
      .title(title)
      .footer({ text: analecta.BringIssue }),
  );

  return true;
};

const internalIssue = externalIssue('approvers');
