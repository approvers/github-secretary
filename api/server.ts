import dotenv from 'dotenv';
import { Client, Message } from 'discord.js';
import { TomlLoader } from '../src/skin/toml-loader';
import fetch from 'node-fetch';
import { Analecta } from '../src/exp/analecta';

dotenv.config();

(async () => {
  const loader = new TomlLoader(process.env.TOML_PATH || './example/laffey.toml');
  const analecta = await loader.load();

  const client = new Client();

  const ghPattern = /^\/gh\s*(.*)\/(.*)$/;
  const numbersPattern = /[1-9][0-9]*/;
  const callPattern = new RegExp(analecta.CallPattern);

  client.on('ready', () => {
    console.log('I got ready.');
  });

  client.on('message', async (msg: Message) => {
    if (msg.author.bot) {
      return;
    }
    if (callPattern.test(msg.content)) {
      const mes = [...analecta.Flavor].sort(() => Math.random() - 0.5)[0];
      msg.reply(mes);
    }
    if (ghPattern.test(msg.content)) {
      const matches = msg.content.match(ghPattern);
      if (matches == null) {
        return;
      }

      const repo = matches[1];
      const dst = matches[2];
      if (numbersPattern.test(dst)) {
        msg.channel.startTyping();
        const apiUrl = `https://api.github.com/repos/approvers/${repo}/issues/${dst}`;
        const res = await (await fetch(apiUrl)).json();
        if (!res.url) {
          replyFailure(analecta, msg);
          msg.channel.stopTyping();
          return;
        }
        const {
          state,
          title,
          url,
          user: { avatar_url, login },
        } = res;
        const color = colorFromState(state);
        msg.channel.send({
          embed: {
            color,
            author: {
              name: login,
              icon_url: avatar_url,
            },
            url,
            title,
            footer: { text: analecta.BringIssue },
          },
        });
        msg.channel.stopTyping();
        return;
      }

      replyFailure(analecta, msg);
    }
  });

  client.login(process.env.DISCORD_TOKEN);
})().catch((e) => console.error(e));

const replyFailure = (analecta: Analecta, msg: Message): void => {
  const mes = [...analecta.Failure].sort(() => Math.random() - 0.5)[0];
  msg.reply(mes);
};

const colorFromState = (state: string): number => {
  switch (state) {
    case 'open':
      return 0x11aa11;
    case 'closed':
      return 0xaa1111;
    default:
      return 0x000000;
  }
};
