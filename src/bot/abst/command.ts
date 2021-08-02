import type { DiscordId } from "../exp/discord-id";
import type { MessageEmbed } from "discord.js";

export interface ApplicationCommand {
  name: string;
  description: string;
  options: ApplicationCommandOption[];

  getAuthorId(): DiscordId;
  matchCommand(regex: RegExp): Promise<RegExpMatchArray | null>;
  reply(message: string): Promise<void>;
  sendEmbed(embed: MessageEmbed): Promise<void>;
  panic(reason: unknown): never;
}

export const commandIntoBody = (command: ApplicationCommand): unknown => ({
  ...command,
  options: command.options.map(optionIntoRawValue),
});

export interface ApplicationCommandOption {
  type: number;
  name: string;
  description: string;
  required?: boolean;
  choices?: ApplicationCommandOptionChoice[];
  options?: ApplicationCommandOption[];
}

const optionIntoRawValue = (self: ApplicationCommandOption): unknown => ({
  ...self,
  options: self.options?.map(optionIntoRawValue),
});

export type ApplicationCommandOptionType =
  | "SUB_COMMAND"
  | "SUB_COMMAND_GROUP"
  | "STRING"
  | "INTEGER"
  | "BOOLEAN"
  | "USER"
  | "CHANNEL"
  | "ROLE";

export const commandOptionTypeMap: Record<
  ApplicationCommandOptionType,
  number
> = {
  SUB_COMMAND: 1,
  SUB_COMMAND_GROUP: 2,
  STRING: 3,
  INTEGER: 4,
  BOOLEAN: 5,
  USER: 6,
  CHANNEL: 7,
  ROLE: 8,
};

export const commandOptionTypeReverseMap: Record<
  number,
  ApplicationCommandOptionType
> = Object.fromEntries(
  (
    Object.entries(commandOptionTypeMap) as [
      ApplicationCommandOptionType,
      number,
    ][]
  ).map<[number, ApplicationCommandOptionType]>(([key, value]) => [value, key]),
);

export interface ApplicationCommandOptionChoice {
  name: string;
  value: string | number;
}
