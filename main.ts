import { config } from "https://deno.land/x/dotenv/mod.ts";
import {
  Client,
  Message,
  DMChannel,
} from "https://deno.land/x/coward@v0.3.1/mod.ts";

import { TomlLoader } from "./src/skin/toml-loader.ts";
import { PlainDB } from "./src/skin/plain-db.ts";
import { SubscriptionNotifier } from "./src/skin/notifier.ts";
import { GitHubApi } from "./src/skin/github-api.ts";
import { procs } from "./src/skin/procs.ts";
import { Analecta } from "./src/exp/analecta.ts";
import { CommandProcessor } from "./src/abst/connector.ts";
import { DiscordMessage } from "./src/skin/discord-message.ts";

const messageHandler = (analecta: Analecta, builtProcs: CommandProcessor) =>
  async (
    msg: Message,
  ) => {
    if (msg.author.bot) {
      return;
    }
    if (msg.content.startsWith("/gh?")) {
      const dm = await client.getDMChannel(msg.author.id);
      dm.send(analecta.HelpMessage);
      return;
    }
    const discordMessage = new DiscordMessage(msg, client);
    await builtProcs(analecta, discordMessage);
  };

const cfg = { ...config(), ...Deno.env.toObject() };

const client = new Client(cfg.DISCORD_TOKEN || "no token");

const loader = new TomlLoader(cfg.TOML_PATH || "./example/laffey.toml");
const analecta = await loader.load();

const db = await PlainDB.make(cfg.DB_CACHE_PATH || "./.cache/users.json");

const notifier = new SubscriptionNotifier(
  analecta,
  {
    fetch: (userId: string): Promise<DMChannel> => client.getDMChannel(userId),
  },
  db,
);
db.onUpdate(notifier);
const query = new GitHubApi();

const builtProcs = procs(analecta, db, query);

client.evt.ready.attach(() => {
  console.log("I got ready.");
});

client.evt.messageCreate.attach(async ({ message }: { message: Message }) => {
  messageHandler(analecta, builtProcs)(message);
});

client.connect();
