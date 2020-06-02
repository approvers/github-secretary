import fetch from 'node-fetch';
import { Message, MessageEmbed, EmbedFieldData } from 'discord.js';

import { Analecta } from '../../exp/analecta';
import { colorFromState } from '../../exp/state-color';
import { replyFailure } from '../reply-failure';
import { CommandProcessor, connectProcessors } from '../../abst/connector';
import { omitBody } from '../../exp/omit';

const ghPattern = /^\/ghp\s+([^/]+)(\/([^/]+)(\/([^/]+))?)?$/;
const numbersPattern = /^[1-9][0-9]*$/;

export const bringPR = async (analecta: Analecta, msg: Message): Promise<boolean> => {
  const content = msg.content.split('\n')[0];
  if (!ghPattern.test(content)) {
    return false;
  }

  const matches = content.match(ghPattern);
  if (matches == null) {
    return false;
  }

  msg.channel.startTyping();
  const res = await connectProcessors([
    externalPR(matches[1])(matches[3], matches[5]),
    internalPR(matches[1], matches[3]),
    externalPRList(matches[1])(matches[3]),
    internalPRList(matches[1]),
    replyFailure,
  ])(analecta, msg);
  msg.channel.stopTyping();
  return res;
};

const externalPRList = (owner: string) => (repo: string): CommandProcessor => async (
  analecta: Analecta,
  msg: Message,
) => {
  const repoInfoApiUrl = `https://api.github.com/repos/${owner}/${repo}`;
  const infoRes = await (await fetch(repoInfoApiUrl)).json();
  if (infoRes.message === 'Not Found') {
    return false;
  }
  const {
    name: repoName,
    html_url,
    owner: { avatar_url, login },
  } = infoRes;

  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/pulls`;
  const res = await (await fetch(apiUrl)).json();
  if (res.message === 'Not Found') {
    return false;
  }

  const fields: EmbedFieldData[] = (res as {
    html_url: string;
    title: string;
    number: string;
  }[]).map(({ html_url, title, number }) => ({
    name: `#${number}`,
    value: `[${title}](${html_url})`,
  }));
  if (fields.length <= 0) {
    msg.reply(analecta.NothingToBring);
    return true;
  }

  msg.channel.send(
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

const externalPR = (owner: string) => (repo: string, dst: string): CommandProcessor => async (
  analecta: Analecta,
  msg: Message,
) => {
  if (!numbersPattern.test(dst)) {
    return false;
  }

  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${dst}`;
  const res = await (await fetch(apiUrl)).json();
  if (res.message === 'Not Found') {
    return false;
  }

  const {
    state,
    title,
    body,
    html_url,
    user: { avatar_url, login },
  } = res;
  const color = colorFromState(state);
  const description = omitBody(body);
  msg.channel.send(
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
