import dotenv from 'dotenv';
import { Client, Message } from 'discord.js';

import { TomlLoader } from '../src/bot/skin/toml-loader';
import { PlainDB } from '../src/bot/skin/plain-db';

import { procs } from '../src/bot/skin/procs';
import { SubscriptionNotifier } from '../src/bot/skin/notifier';
import { Analecta } from '../src/bot/exp/analecta';
import { CommandProcessor } from '../src/bot/abst/connector';
import { GitHubApi } from '../src/bot/skin/github-api';
import { DiscordMessage } from '../src/bot/skin/discord-message';

dotenv.config();

const messageHandler = (analecta: Analecta, builtProcs: CommandProcessor) => async (
  msg: Message,
) => {
  if (msg.author.bot) {
    return;
  }
  if (msg.content.startsWith('/gh?')) {
    const dm = await msg.author.createDM();
    dm.send(analecta.HelpMessage);
    return;
  }
  const discordMessage = new DiscordMessage(msg);
  await builtProcs(analecta, discordMessage);
};

(async () => {
  const loader = new TomlLoader(process.env.TOML_PATH || './example/laffey.toml');
  const db = await PlainDB.make(process.env.DB_CACHE_PATH || './.cache/users.json');
  const analecta = await loader.load();

  const client = new Client();
  const notifier = new SubscriptionNotifier(analecta, client.users, db);
  db.onUpdate(notifier);
  const query = new GitHubApi();

  const builtProcs = procs(analecta, db, query);

  client.on('ready', () => {
    console.log('I got ready.');
  });

  client.on('message', messageHandler(analecta, builtProcs));

  client.login(process.env.DISCORD_TOKEN);
})().catch((e) => console.error(e));
