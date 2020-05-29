import dotenv from 'dotenv';
import { Client, Message } from 'discord.js';
import { TomlLoader } from '../src/skin/toml-loader';

dotenv.config();

(async () => {
  const loader = new TomlLoader(process.env.TOML_PATH || './example/laffey.toml');
  const analecta = await loader.load();

  const client = new Client();

  client.on('ready', () => {
    console.log('I got ready.');
  });

  client.on('message', (msg: Message) => {
    if (msg.content === 'ラフィー') {
      const mes = [...analecta.Flavor].sort(() => Math.random() - 0.5)[0];
      msg.reply(mes);
    }
  });

  client.login(process.env.DISCORD_TOKEN);
})().catch((e) => console.error(e));
