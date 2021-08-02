import { Client, Message } from "discord.js";
import type { Analecta } from "../exp/analecta";
import type { CommandProcessor } from "../abst/connector";
import { DiscordMessage } from "../skin/discord-message";
import { FaunaDB } from "../skin/fauna-db";
import { GitHubApi } from "../skin/github-api";
import { SubscriptionNotifier } from "../skin/notifier";
import { TomlLoader } from "../skin/toml-loader";
import dotenv from "dotenv";
import { procs } from "./procs";

dotenv.config();

const messageHandler =
  (analecta: Analecta, builtProcs: CommandProcessor) =>
  async (msg: Message) => {
    if (msg.author.bot) {
      return;
    }
    if (msg.content.startsWith("/gh?")) {
      const dm = await msg.author.createDM();
      dm.send(analecta.HelpMessage);
      return;
    }
    const discordMessage = new DiscordMessage(msg);
    await builtProcs(analecta, discordMessage);
  };

(async () => {
  const loader = new TomlLoader(
    process.env.TOML_PATH || "./analecta/laffey.toml",
  );
  const db = new FaunaDB(process.env.FAUNA_SECRET || "UNSET");
  const analecta = await loader.load();

  const client = new Client();
  const notifier = new SubscriptionNotifier(analecta, client.users, db);
  db.onUpdate(notifier);
  const query = new GitHubApi();

  const builtProcs = procs(analecta, db, query);

  client.on("ready", () => {
    console.log("I got ready.");
  });

  client.on("message", messageHandler(analecta, builtProcs));

  client.login(process.env.DISCORD_TOKEN);
})().catch((err) => console.error(err));
