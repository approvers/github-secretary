import { MessageEmbed } from 'discord.js';

export type Message = {
  matchPlainText(regex: RegExp): Promise<RegExpMatchArray | null>;
  matchCommand(regex: RegExp): Promise<RegExpMatchArray | null>;
  withTyping(callee: () => Promise<boolean>): Promise<boolean>;
  reply(message: string): Promise<void>;
  sendEmbed(embed: MessageEmbed): Promise<void>;
};
