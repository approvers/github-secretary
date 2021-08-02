import { messageHandler, procs } from "./procs";
import { Client } from "discord.js";
import { FaunaDB } from "../skin/fauna-db";
import { GitHubApi } from "../skin/github-api";
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
