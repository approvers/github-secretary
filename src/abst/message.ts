import { MessageEmbed } from 'discord.js';

import { DiscordId } from '../exp/github-user';

export type Message = {
  getAuthorId(): DiscordId;
  matchPlainText(regex: RegExp): Promise<RegExpMatchArray | null>;
  matchCommand(regex: RegExp): Promise<RegExpMatchArray | null>;
  withTyping(callee: () => Promise<boolean>): Promise<boolean>;
  reply(message: string): Promise<void>;
  sendEmbed(embed: MessageEmbed): Promise<void>;
};
