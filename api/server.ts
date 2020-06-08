import dotenv from 'dotenv';
import { Client, Message } from 'discord.js';

import { TomlLoader } from '../src/skin/toml-loader';
import { PlainDB } from '../src/skin/plain-db';

import { procs } from '../src/abst/procs';
import { SubscriptionNotifier } from '../src/abst/subscription/notifier';
import { Analecta } from 'src/exp/analecta';
import { CommandProcessor } from 'src/abst/connector';
import { GitHubApi } from '../src/skin/github-api';

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
  await builtProcs(analecta, msg);
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
