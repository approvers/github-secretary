import {
  ApplicationCommand,
  ApplicationCommandOption,
  commandOptionTypeMap,
} from "../abst/command";
import type { Client, CommandInteraction } from "discord.js";
import type { DiscordId } from "../exp/discord-id";
import type { Message } from "../abst/message";

const organizationOption: ApplicationCommandOption = {
  name: "org",
  description: "The organization name.",
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
  options: [organizationOption, repositoryOption],
};

const branchCommand: ApplicationCommand = {
  name: "ghb",
  description: "Fetch the branch in the repository.",
  options: [organizationOption, repositoryOption, branchOption],
};

const issueCommand: ApplicationCommand = {
  name: "ghi",
  description: "Fetch the issue in the repository.",
  options: [organizationOption, repositoryOption, issueOption],
};

const prCommand: ApplicationCommand = {
  name: "ghi",
  description: "Fetch the pull request in the repository.",
  options: [organizationOption, repositoryOption, issueOption],
};

const commands = [repositoryCommand, branchCommand, issueCommand, prCommand];

export type Handler = (message: Message) => Promise<void>;

export class InteractionsCommandReceiver {
  constructor(private readonly client: Client) {
    client.on("messageCreate", async () => {
      if (this.initialized) {
        return;
      }
      this.initialized = true;
      const registrar = client.guilds.cache.get("")?.commands;
      if (!registrar) {
        return;
      }
      await Promise.all(commands.map((command) => registrar.create(command)));
    });
    client.on("interactionCreate", (interaction) => {
      if (!interaction.isCommand()) {
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
        interaction.reply({ embeds: [embed] });
        return Promise.resolve();
      },
      panic: (reason) => {
        console.error(reason);
        throw new Error();
      },
    };
  }

  private buildCommandStr(interaction: CommandInteraction): string {
    let commandStr = `/${interaction.commandName} `;
    commandStr += interaction.options.data
      .filter(({ name }) => name !== "branch")
      .map(({ value }) => value)
      .join("/");
    commandStr += interaction.options.data
      .filter(({ name }) => name === "branch")
      .map(({ value }) => value)
      .join(" ");
    return commandStr;
  }
}
