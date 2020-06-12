import { MessageEmbed } from 'discord.js';

export type Message = {
  match(regex: RegExp): Promise<RegExpMatchArray | null>;
  withTyping(callee: () => Promise<boolean>): Promise<boolean>;
  reply(message: string): Promise<void>;
  sendEmbed(embed: MessageEmbed): Promise<void>;
};
