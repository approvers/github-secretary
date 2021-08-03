import {
  ApplicationCommand,
  ApplicationCommandOption,
  ApplicationCommandOptionType,
} from "../abst/command";
import { DiscordId } from "../exp/discord-id";
import { MessageEmbed } from "discord.js";

export interface InteractionDataOption {
  name: string;
  type: ApplicationCommandOptionType;
  value?: string;
  options?: readonly InteractionDataOption[];
}

export interface InteractionData {
  id: string;
  name: string;
  resolved?: string;
  options?: readonly InteractionDataOption[];
}

export interface Interaction {
  type: "1" | "2";
  token: string;
  data: InteractionData;
}

export class DiscordCommand implements ApplicationCommand {
  constructor(private readonly interaction: Interaction) {}

  get name(): string {
    throw new Error("Method not implemented.");
  }

  get description(): string {
    throw new Error("Method not implemented.");
  }

  get options(): ApplicationCommandOption[] {
    throw new Error("Method not implemented.");
  }

  getAuthorId(): DiscordId {
    throw new Error("Method not implemented.");
  }

  matchCommand(regex: RegExp): Promise<RegExpMatchArray | null> {
    throw new Error("Method not implemented.");
  }

  reply(message: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

  sendEmbed(embed: MessageEmbed): Promise<void> {
    throw new Error("Method not implemented.");
  }

  panic(reason: unknown): never {
    throw new Error("Method not implemented.");
  }
}
