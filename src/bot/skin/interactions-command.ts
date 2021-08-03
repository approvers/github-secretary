import type { Client, GuildChannel, GuildMember } from "discord.js";
import { CommandBuilder, Slash } from "discord.js-slash-command";
import type { DiscordId } from "../exp/discord-id";
import type { Message } from "../abst/message";
import { commandOptionTypeMap } from "../abst/command";

const organizationOption = new CommandBuilder();
organizationOption.setName("org");
organizationOption.setDescription("The organization name.");
organizationOption.setType(commandOptionTypeMap.STRING);

const repositoryOption = new CommandBuilder();
repositoryOption.setName("repo");
repositoryOption.setDescription("The repository name.");
repositoryOption.setType(commandOptionTypeMap.STRING);
repositoryOption.setRequired(true);

const branchOption = new CommandBuilder();
repositoryOption.setName("branch");
repositoryOption.setDescription("The branch name.");
repositoryOption.setType(commandOptionTypeMap.STRING);

const issueOption = new CommandBuilder();
repositoryOption.setName("issue");
repositoryOption.setDescription("The issue number.");
repositoryOption.setType(commandOptionTypeMap.INTEGER);

const repositoryCommand = new CommandBuilder();
repositoryCommand.setName("ghr");
repositoryCommand.setDescription("Fetch the repository.");
repositoryCommand.addOption(organizationOption);
repositoryCommand.addOption(repositoryOption);

const branchCommand = new CommandBuilder();
branchCommand.setName("ghb");
branchCommand.setDescription("Fetch the branch in the repository.");
branchCommand.addOption(organizationOption);
branchCommand.addOption(repositoryOption);
branchCommand.addOption(branchOption);

const issueCommand = new CommandBuilder();
issueCommand.setName("ghi");
issueCommand.setDescription("Fetch the issue in the repository.");
issueCommand.addOption(organizationOption);
issueCommand.addOption(repositoryOption);
issueCommand.addOption(issueOption);

const prCommand = new CommandBuilder();
prCommand.setName("ghp");
prCommand.setDescription("Fetch the pull request in the repository.");
prCommand.addOption(organizationOption);
prCommand.addOption(repositoryOption);
prCommand.addOption(issueOption);

const commands = [repositoryCommand, branchCommand, issueCommand, prCommand];

interface Interaction {
  id: string;
  command: {
    name: string;
    options?: readonly {
      name: string;
      type: number;
      value: unknown;
    }[];
  };
  author: GuildMember;
  channel: GuildChannel;
  callback(message: unknown): void;
}

export type Handler = (message: Message) => Promise<void>;

export class InteractionsCommandReceiver {
  constructor(private readonly client: Client) {
    this.slash = new Slash(client);
    for (const command of commands) {
      this.slash.create(command);
    }
    this.slash.on("slashInteraction", this.onCommand);
  }

  private slash: Slash;

  private handlers: Handler[] = [];

  onReceive(handler: Handler): void {
    this.handlers.push(handler);
  }

  private onCommand(interaction: Interaction) {
    const commandStr = this.buildCommandStr(interaction);
    const message: Message = this.buildMessage(interaction, commandStr);
    for (const handler of this.handlers) {
      handler(message);
    }
  }

  private buildMessage(interaction: Interaction, commandStr: string): Message {
    return {
      getAuthorId: () => interaction.author.id as DiscordId,
      matchPlainText: () => Promise.resolve(null),
      matchCommand: (regex) => Promise.resolve(regex.exec(commandStr)),
      withTyping: (callee) => callee(),
      reply: (text) => {
        interaction.callback(text);
        return Promise.resolve();
      },
      sendEmbed: (embed) => {
        interaction.callback(embed);
        return Promise.resolve();
      },
      panic: (reason) => {
        console.error(reason);
        throw new Error();
      },
    };
  }

  private buildCommandStr(interaction: Interaction): string {
    let commandStr = `/${interaction.command.name} `;
    if (interaction.command.options) {
      commandStr += interaction.command.options
        .filter(({ name }) => name !== "branch")
        .map(({ value }) => value)
        .join("/");
      commandStr += interaction.command.options
        .filter(({ name }) => name === "branch")
        .map(({ value }) => value)
        .join(" ");
    }
    return commandStr;
  }
}
