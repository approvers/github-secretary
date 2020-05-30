import fetch from 'node-fetch';
import { Message } from 'discord.js';

import { Analecta } from '../exp/analecta';
import { colorFromState } from '../exp/state-color';
import { replyFailure } from './reply-failure';
import { CommandProcessor } from '../abst/connector';

const ghPattern = /^\/gh\s*(.*)\/(.*)$/;
const numbersPattern = /[1-9][0-9]*/;

export const bringIssue = async (analecta: Analecta, msg: Message): Promise<boolean> => {
  if (!ghPattern.test(msg.content)) {
    return false;
  }

  const matches = msg.content.match(ghPattern);
  if (matches == null) {
    return false;
  }

  const repo = matches[1];
  const dst = matches[2];
  if (!numbersPattern.test(dst)) {
    replyFailure(analecta, msg);
    return false;
  }

  msg.channel.startTyping();
  internalIssue(repo, dst)(analecta, msg);
  msg.channel.stopTyping();
  return true;
};

const omitBody = (body: string): string => (body.length >= 80 ? body.slice(0, 80) + '...' : body);

const internalIssue = (repo: string, dst: string): CommandProcessor => async (
  analecta: Analecta,
  msg: Message,
) => {
  const apiUrl = `https://api.github.com/repos/approvers/${repo}/issues/${dst}`;
  const res = await (await fetch(apiUrl)).json();
  if (!res.url) {
    replyFailure(analecta, msg);
    msg.channel.stopTyping();
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
  msg.channel.send({
    embed: {
      color,
      author: {
        name: login,
        icon_url: avatar_url,
      },
      url: html_url,
      description,
      title,
      footer: { text: analecta.BringIssue },
    },
  });

  return true;
};
