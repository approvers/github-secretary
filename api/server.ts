import dotenv from 'dotenv';
import { Client, Message } from 'discord.js';
import { TomlLoader } from '../src/skin/toml-loader';
import { procs } from '../src/op/';
import { PlainDB } from '../src/skin/plain-db';
import { SubscriptionNotifier } from '../src/exp/notify';

dotenv.config();

(async () => {
  const loader = new TomlLoader(process.env.TOML_PATH || './example/laffey.toml');
  const db = await PlainDB.make(process.env.DB_CACHE_PATH || './.cache/users.json');
  const analecta = await loader.load();

  const client = new Client();
  const notifier = new SubscriptionNotifier(analecta, client, db);
  const builtProcs = procs(analecta, db, notifier);

  client.on('ready', () => {
    console.log('I got ready.');
  });

  client.on('message', async (msg: Message) => {
    if (msg.author.bot) {
      return;
    }
    if (msg.content.startsWith('/gh?')) {
      const dm = await msg.author.createDM();
      dm.send(`\`\`\`
Repository:  /ghr (所属/)レポジトリ名 ==> リポジトリを持ってくる……
Issue:       /ghi (所属/)レポジトリ名(/数字) ==> Issue を持ってくる……
PR:          /ghp (所属/)レポジトリ名(/数字) ==> PR を持ってくる……
Subscribe:   /ghs GitHubのID/通知トークン ==> GitHub 通知を DM にお届けする……
Unsubscribe: /ghu ==> GitHub 通知を DM にお届けしなくなる……
\`\`\``);
      return;
    }
    await builtProcs(analecta, msg);
  });

  client.login(process.env.DISCORD_TOKEN);
})().catch((e) => console.error(e));
