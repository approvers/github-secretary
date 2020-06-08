import { Analecta } from '../../exp/analecta';
import { Message, MessageEmbed } from 'discord.js';
import { CommandProcessor, connectProcessors } from '../../abst/connector';
import fetch from 'node-fetch';
import { replyFailure } from '../reply-failure';

const ghPattern = /^\/ghr\s+([^/]+)(\/(.+))?$/;

export const bringRepo = async (analecta: Analecta, msg: Message): Promise<boolean> => {
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
    internalRepo(matches[1]),
    externalRepo(matches[1])(matches[3]),
    replyFailure,
  ])(analecta, msg).catch((e) => {
    replyFailure(analecta, msg);
    msg.channel.stopTyping();
    throw e;
  });
  msg.channel.stopTyping();
  return res;
};

const externalRepo = (owner: string) => (repo: string): CommandProcessor => async (
  analecta: Analecta,
  msg: Message,
): Promise<boolean> => {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
  const res = await await (await fetch(apiUrl)).json();

  if (!res.url) {
    return false;
  }

  const {
    name,
    description,
    html_url,
    owner: { avatar_url, login },
  }: {
    name: string;
    description?: string;
    html_url: string;
    owner: { avatar_url: string; login: string };
  } = res;
  msg.channel.send(
    new MessageEmbed()
      .setAuthor(login, avatar_url)
      .setURL(html_url)
      .setDescription(description || '')
      .setTitle(name)
      .setFooter(analecta.Subscribe),
  );

  return true;
};

const internalRepo = externalRepo('approvers');
