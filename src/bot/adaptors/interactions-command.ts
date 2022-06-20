import {
  ApplicationCommand,
  ApplicationCommandOption,
  commandOptionTypeMap,
} from "./discord-command.js";
import {
  Client,
  CommandInteraction,
  InteractionCollector,
  MessageComponentInteraction,
} from "discord.js";
import { PagesSender, isButtonId, sendPages } from "./pagination.js";
import type { DiscordId } from "../model/discord-id.js";
import type { Message } from "../model/message.js";
import { intoMessageEmbed } from "./message-convert.js";

const ownerOption: ApplicationCommandOption = {
  name: "owner",
  description: "The owner name.",
  type: commandOptionTypeMap.STRING,
};

const repositoryOption: ApplicationCommandOption = {
  name: "repo",
  description: "The repository name.",
  type: commandOptionTypeMap.STRING,
  required: true,
};

const branchOption: ApplicationCommandOption = {
  name: "branch",
  description: "The branch name.",
  type: commandOptionTypeMap.STRING,
};

const issueOption: ApplicationCommandOption = {
  name: "issue",
  description: "The issue number.",
  type: commandOptionTypeMap.INTEGER,
};

const repositoryCommand: ApplicationCommand = {
  name: "ghr",
  description: "Fetch the repository.",
  options: [repositoryOption, ownerOption],
};

const branchCommand: ApplicationCommand = {
  name: "ghb",
  description: "Fetch the branch in the repository.",
  options: [repositoryOption, ownerOption, branchOption],
};

const issueCommand: ApplicationCommand = {
  name: "ghi",
  description: "Fetch the issue in the repository.",
  options: [repositoryOption, ownerOption, issueOption],
};

const prCommand: ApplicationCommand = {
  name: "ghp",
  description: "Fetch the pull request in the repository.",
  options: [repositoryOption, ownerOption, issueOption],
};

const commands: ApplicationCommand[] = [
  repositoryCommand,
  branchCommand,
  issueCommand,
  prCommand,
];

const GUILD_ID = "683939861539192860";
const ONE_MINUTE_MS = 60_000;

export type Handler = (message: Message) => Promise<void>;

export class InteractionsCommandReceiver {
  constructor(client: Client) {
    client.on("messageCreate", async () => {
      const registrar = client.guilds.cache.get(GUILD_ID)?.commands;
      if (!registrar) {
        return;
      }

      if (this.initialized) {
        return;
      }
      this.initialized = true;

      await registrar.set(commands);
    });
    client.on("interactionCreate", (interaction) => {
      if (!interaction.isCommand()) {
        return;
      }
      if (interaction.guildId !== GUILD_ID) {
        return;
      }
      this.onCommand(interaction);
    });
  }

  private initialized = false;

  private handlers: Handler[] = [];

  onReceive(handler: Handler): void {
    this.handlers.push(handler);
  }

  private onCommand(interaction: CommandInteraction) {
    const commandStr = this.buildCommandStr(interaction);
    const message: Message = this.buildMessage(interaction, commandStr);
    for (const handler of this.handlers) {
      handler(message);
    }
  }

  private buildMessage(
    interaction: CommandInteraction,
    commandStr: string,
  ): Message {
    return {
      getAuthorId: () => interaction.user.id as DiscordId,
      matchPlainText: () => Promise.resolve(null),
      matchCommand: (regex) => Promise.resolve(regex.exec(commandStr)),
      withTyping: (callee) => callee(),
      reply: (text) => {
        interaction.reply(text);
        return Promise.resolve();
      },
      sendEmbed: (embed) => {
        interaction.reply({ embeds: [intoMessageEmbed(embed)] });
        return Promise.resolve();
      },
      sendPages: sendPages(adaptor(interaction)),
      panic: (reason) => {
        console.error(reason);
        throw new Error();
      },
    };
  }

  private buildCommandStr(interaction: CommandInteraction): string {
    let commandStr = `/${interaction.commandName} `;
    const [ownerArg] = interaction.options.data.filter(
      ({ name }) => name === "owner",
    );
    if (ownerArg) {
      commandStr += `${ownerArg.value}/`;
    }
    const [repoArg] = interaction.options.data.filter(
      ({ name }) => name === "repo",
    );
    commandStr += repoArg.value;
    const [issueArg] = interaction.options.data.filter(
      ({ name }) => name === "issue",
    );
    if (issueArg) {
      commandStr += `/${issueArg.value}`;
    }
    const [branchArg] = interaction.options.data.filter(
      ({ name }) => name === "branch",
    );
    if (branchArg) {
      commandStr += ` ${branchArg.value}`;
    }
    return commandStr;
  }
}

const adaptor = (interaction: CommandInteraction): PagesSender => {
  let collector: InteractionCollector<MessageComponentInteraction> | null =
    null;
  return {
    send(message) {
      return interaction.reply(message);
    },
    onClick(handler) {
      if (!interaction.channel) {
        throw new Error("pages unavailable on the channel");
      }
      collector = interaction.channel.createMessageComponentCollector({
        filter: (buttonInteraction) =>
          buttonInteraction.user.id === interaction.user.id,
        time: ONE_MINUTE_MS,
      });
      collector.on("collect", (buttonInteraction) => {
        if (isButtonId(buttonInteraction.customId)) {
          handler(buttonInteraction.customId, async (content) => {
            await buttonInteraction.editReply(content);
          });
        }
      });
    },
    onFinish(handler) {
      collector?.on("end", () =>
        handler(async (content) => {
          await interaction.editReply(content);
        }),
      );
    },
  };
};
