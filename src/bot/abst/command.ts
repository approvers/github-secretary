export interface ApplicationCommand {
  name: string;
  description: string;
  options: ApplicationCommandOption[];
}

export const commandIntoBody = (command: ApplicationCommand): unknown => ({
  ...command,
  options: command.options.map(optionIntoRawValue),
});

export interface ApplicationCommandOption {
  type: ApplicationCommandOptionType;
  name: string;
  description: string;
  required?: boolean;
  choices?: ApplicationCommandOptionChoice[];
  options?: ApplicationCommandOption[];
}

const optionIntoRawValue = (self: ApplicationCommandOption): unknown => ({
  ...self,
  type: commandOptionTypeMap[self.type],
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

const commandOptionTypeMap: Record<ApplicationCommandOptionType, number> = {
  SUB_COMMAND: 1,
  SUB_COMMAND_GROUP: 2,
  STRING: 3,
  INTEGER: 4,
  BOOLEAN: 5,
  USER: 6,
  CHANNEL: 7,
  ROLE: 8,
};

export interface ApplicationCommandOptionChoice {
  name: string;
  value: string | number;
}
