import {
  ApplicationCommand,
  ApplicationCommandOption,
  commandOptionTypeMap,
} from "./discord-command.js";
import {
  Client,
  CommandInteraction,
  MessageActionRow,
  MessageButton,
  MessageComponentInteraction,
  MessageEmbed,
} from "discord.js";
import type { EmbedPage, Message } from "../model/message.js";
import type { DiscordId } from "../model/discord-id.js";
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
const CONTROLS = new MessageActionRow().addComponents(
  new MessageButton()
    .setStyle("SECONDARY")
    .setCustomId("prev")
    .setLabel("戻る")
    .setEmoji("⏪"),
  new MessageButton()
    .setStyle("SECONDARY")
    .setCustomId("next")
    .setLabel("進む")
    .setEmoji("⏩"),
);
const DISABLED_CONTROLS = new MessageActionRow().addComponents(
  new MessageButton()
    .setStyle("SECONDARY")
    .setCustomId("prev")
    .setLabel("戻る")
    .setEmoji("⏪")
    .setDisabled(true),
  new MessageButton()
    .setStyle("SECONDARY")
    .setCustomId("next")
    .setLabel("進む")
    .setEmoji("⏩")
    .setDisabled(true),
);

const pagesFooter = (currentPage: number, pagesLength: number) =>
  `ページ ${currentPage + 1}/${pagesLength}`;

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
      sendPages: sendPages(interaction),
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

const sendPages =
  (interaction: CommandInteraction) => async (pages: EmbedPage[]) => {
    if (pages.length === 0) {
      throw new Error("pages must not be empty array");
    }

    const generatePage = (index: number) =>
      intoMessageEmbed(pages[index]).setFooter({
        text: pagesFooter(index, pages.length),
      });

    await interaction.reply({
      embeds: [generatePage(0)],
      components: [CONTROLS],
    });

    if (!interaction.channel) {
      throw new Error("pages unavailable on the channel");
    }

    const collector = interaction.channel.createMessageComponentCollector({
      filter: (buttonInteraction) =>
        buttonInteraction.user.id === interaction.user.id,
      time: ONE_MINUTE_MS,
    });
    collector.on("collect", controlsHandler(pages.length, generatePage));
    collector.on("end", () => {
      interaction.editReply({
        components: [DISABLED_CONTROLS],
      });
    });
  };

const controlsHandler = (
  pagesLength: number,
  generatePage: (index: number) => MessageEmbed,
) => {
  let currentPage = 0;
  return async (interaction: MessageComponentInteraction) => {
    switch (interaction.customId) {
      case "prev":
        if (currentPage > 0) {
          currentPage -= 1;
        } else {
          currentPage = pagesLength - 1;
        }
        break;
      case "next":
        if (currentPage < pagesLength - 1) {
          currentPage += 1;
        } else {
          currentPage = 0;
        }
        break;
      default:
        return;
    }
    await interaction.editReply({ embeds: [generatePage(currentPage)] });
  };
};
