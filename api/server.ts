import dotenv from 'dotenv';
import { Client, Message } from 'discord.js';
import { TomlLoader } from '../src/skin/toml-loader';
import { procs } from '../src/op/';

dotenv.config();

(async () => {
  const loader = new TomlLoader(process.env.TOML_PATH || './example/laffey.toml');
  const analecta = await loader.load();

  const client = new Client();
  const builtProcs = procs(analecta);

  client.on('ready', () => {
    console.log('I got ready.');
  });

  client.on('message', async (msg: Message) => {
    if (msg.author.bot) {
      return;
    }
    await builtProcs(analecta, msg);
  });

  client.login(process.env.DISCORD_TOKEN);
})().catch((e) => console.error(e));
