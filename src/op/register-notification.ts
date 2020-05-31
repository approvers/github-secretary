import { DiscordId, GitHubUser } from '../exp/github-user';
import { Message } from 'discord.js';
import { Analecta } from '../exp/analecta';
import { CommandProcessor } from '../abst/connector';
import fetch from 'node-fetch';

export type UserDatabase = {
  register: (id: DiscordId, user: GitHubUser) => Promise<void>;
};

const registerPattern = /\/ghr ([^:]+):([^:]+)/;

export const registerNotification = (db: UserDatabase): CommandProcessor => async (
  analecta: Analecta,
  msg: Message,
): Promise<boolean> => {
  if (registerPattern.test(msg.content)) {
    return false;
  }

  const matches = msg.content.match(registerPattern);
  if (matches == null || matches[1] == null || matches[2] == null) {
    return false;
  }
  const res = await fetch(`https://api.github.com/notifications`, {
    headers: {
      Authrozation: `Basic ` + Buffer.from(`${matches[1]}:${matches[2]}`).toString('base64'),
    },
  });
  if (!res.ok) {
    msg.reply(analecta.InvalidToken);
    return true;
  }

  db.register(msg.author.id, {
    userName: matches[1],
    notificationToken: matches[2],
  });

  msg.reply(analecta.Subscribe);
  return true;
};
