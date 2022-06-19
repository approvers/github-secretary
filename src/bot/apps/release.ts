import { Client, Intents, Message as RawDiscordMessage } from "discord.js";
import { CommandProcessor, connectProcessors } from "../runners/connector.js";
import {
  Message,
  bringBranch,
  bringIssue,
  bringPR,
  bringRepo,
  error,
  flavor,
} from "../services/command.js";
import { Analecta } from "../model/analecta.js";
import { DiscordMessage } from "../adaptors/discord-message.js";
import { FaunaDB } from "../adaptors/fauna-db.js";
import { GitHubApi } from "../adaptors/github-api.js";
import {
  // Newline for format
  InteractionsCommandReceiver,
} from "../adaptors/interactions-command.js";
import { Scheduler } from "../runners/scheduler.js";
import { TomlLoader } from "../adaptors/toml-loader.js";
import dotenv from "dotenv";
import { markAsRead } from "../services/notify/mark-as-read.js";
import { subscribeNotification } from "../services/notify/subscribe.js";
import { unsubNotification } from "../services/notify/unsubscribe.js";

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
