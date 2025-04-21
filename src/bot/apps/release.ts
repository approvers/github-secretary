import {
  Client,
  GatewayIntentBits,
  Message as RawDiscordMessage,
} from "discord.js";
import {
  type CommandProcessor,
  connectProcessors,
} from "../runners/connector.js";
import {
  type Message,
  bringBranch,
  bringIssue,
  bringPR,
  bringRepo,
  createIssue,
  error,
  flavor,
} from "../services/command.js";
import type { Analecta } from "../model/analecta.js";
import { DiscordMessage } from "../adaptors/discord-message.js";
import { GitHubApi } from "../adaptors/github-api.js";
import {
  // Newline for format
  InteractionsCommandReceiver,
} from "../adaptors/interactions-command.js";
import { TomlLoader } from "../adaptors/toml-loader.js";
import dotenv from "dotenv";

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
  const analecta = await loader.load();

  const client = new Client({
    intents: [
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
    ],
  });
  const query = new GitHubApi();

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
    createIssue(query, analecta),
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
