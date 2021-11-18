import { Client, Intents, Message as RawDiscordMessage } from "discord.js";
import { CommandProcessor, connectProcessors } from "../runners/connector";
import {
  Message,
  bringBranch,
  bringIssue,
  bringPR,
  bringRepo,
  error,
  flavor,
} from "../services/command";
import { Analecta } from "../model/analecta";
import { DiscordMessage } from "../adaptors/discord-message";
import { FaunaDB } from "../adaptors/fauna-db";
import { GitHubApi } from "../adaptors/github-api";
import { InteractionsCommandReceiver } from "../adaptors/interactions-command";
import { Scheduler } from "../runners/scheduler";
import { TomlLoader } from "../adaptors/toml-loader";
import dotenv from "dotenv";
import { markAsRead } from "../services/notify/mark-as-read";
import { subscribeNotification } from "../services/notify/subscribe";
import { unsubNotification } from "../services/notify/unsubscribe";

dotenv.config();

const messageHandler =
  (analecta: Analecta, builtProcs: CommandProcessor<Message>) =>
  async (msg: RawDiscordMessage): Promise<void> => {
    if (msg.author.bot) {
      return;
    }
    if (msg.content.startsWith("/gh?")) {
      const dm = await msg.author.createDM();
      dm.send(analecta.HelpMessage);
      return;
    }
    const discordMessage = new DiscordMessage(msg);
    await builtProcs(discordMessage);
  };

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
  const query = new GitHubApi();

  const scheduler = new Scheduler();

  const builtProcs = connectProcessors([
    flavor(
      new RegExp(analecta.CallPattern, "u"),
      new RegExp(analecta.BlackPattern, "mu"),
      analecta,
    ),
    bringIssue(query, analecta),
    bringPR(query, analecta),
    bringBranch(query, analecta),
    bringRepo(query, analecta),
    subscribeNotification({
      db,
      registry: db,
      query,
      associator: query,
      analecta,
      scheduler,
    }),
    unsubNotification(db, analecta, scheduler),
    markAsRead(db, query, analecta),
    error(analecta),
  ]);

  const interactions = new InteractionsCommandReceiver(client);
  interactions.onReceive(async (message) => {
    await builtProcs(message);
  });

  client.on("ready", () => {
    console.log("I got ready.");
  });

  client.on("messageCreate", messageHandler(analecta, builtProcs));

  client.login(process.env.DISCORD_TOKEN);
})().catch(console.error);
