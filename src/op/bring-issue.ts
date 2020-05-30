import fetch from 'node-fetch';
import { Message } from 'discord.js';

import { Analecta } from '../exp/analecta';
import { colorFromState } from '../exp/state-color';
import { replyFailure } from './reply-failure';
import { CommandProcessor, connectProcessors } from '../abst/connector';
import { omitBody } from '../exp/omit';

const ghPattern = /^\/ghi\s+(.+)\/(.+)(\/(.+))?$/;
const numbersPattern = /[1-9][0-9]*/;

export const bringIssue = async (analecta: Analecta, msg: Message): Promise<boolean> => {
  if (!ghPattern.test(msg.content)) {
    return false;
  }

  const matches = msg.content.match(ghPattern);
  if (matches == null) {
    return false;
  }

  msg.channel.startTyping();
  const res = await connectProcessors([
    internalIssue(matches[1], matches[2]),
    externalIssue(matches[1])(matches[2], matches[4]),
    replyFailure,
  ])(analecta, msg);
  msg.channel.stopTyping();
  return res;
};

const externalIssue = (owner: string) => (repo: string, dst: string): CommandProcessor => async (
  analecta: Analecta,
  msg: Message,
) => {
  if (!numbersPattern.test(dst)) {
    return false;
  }

  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/issues/${dst}`;
  const res = await (await fetch(apiUrl)).json();
  if (!res.url) {
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

const internalIssue = externalIssue('approvers');
