import { MessageEmbed } from 'discord.js';

export type Message = {
  match(regex: RegExp): Promise<RegExpMatchArray>;
  withTyping(callee: () => Promise<void>): Promise<boolean>;
  reply(message: string): Promise<void>;
  sendEmbed(embed: MessageEmbed): Promise<void>;
};
