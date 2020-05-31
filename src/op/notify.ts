import fetch from 'node-fetch';
import { GitHubUser } from '../exp/github-user';
import { User } from 'discord.js';
import { Analecta } from '../exp/analecta';

export const notify = (
  { userName, notificationToken }: GitHubUser,
  analecta: Analecta,
  user: User,
): (() => void) => {
  const timer = setInterval(async () => {
    const res = await (
      await fetch(`https://api.github.com/notifications`, {
        headers: {
          Authrozation:
            `Basic ` + Buffer.from(`${userName}:${notificationToken}`).toString('base64'),
        },
      })
    ).json();

    const subjects = (res as {
      id: number;
      subject: {
        title: string;
        latest_comment_url: string;
      };
    }[]).map(({ id, subject: { title, latest_comment_url } }) => ({
      name: `#${id}`,
      value: `[${title}](${latest_comment_url})`,
    }));

    const dm = await user.createDM();
    dm.send({
      embed: {
        fields: subjects,
        footer: {
          text: analecta.BringIssue,
        },
      },
    });
  }, 10000);
  return (): void => {
    clearInterval(timer);
  };
};
