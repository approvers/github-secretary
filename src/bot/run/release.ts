import { Client, Intents } from "discord.js";
import { messageHandler, procs } from "./procs";
import { FaunaDB } from "../skin/fauna-db";
import { GitHubApi } from "../skin/github-api";
import { InteractionsCommandReceiver } from "../skin/interactions-command";
import { SubscriptionNotifier } from "../skin/notifier";
import { TomlLoader } from "../skin/toml-loader";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  const loader = new TomlLoader(
    process.env.TOML_PATH || "./analecta/laffey.toml",
  );
  const db = new FaunaDB(process.env.FAUNA_SECRET || "UNSET");
  const analecta = await loader.load();

  const client = new Client({
    intents: [
      Intents.FLAGS.DIRECT_MESSAGES,
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MESSAGES,
    ],
  });
  const notifier = new SubscriptionNotifier(analecta, client.users, db);
  db.onUpdate(notifier);
  const query = new GitHubApi();

  const builtProcs = procs(analecta, db, query);

  const interactions = new InteractionsCommandReceiver(client);
  interactions.onReceive(async (message) => {
    await builtProcs(analecta, message);
  });

  client.on("ready", () => {
    console.log("I got ready.");
  });

  client.on("message", messageHandler(analecta, builtProcs));

  client.login(process.env.DISCORD_TOKEN);
})().catch((err) => console.error(err));
