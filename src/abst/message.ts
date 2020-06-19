import { DiscordId } from '../exp/discord-id.ts';
import { EmbedMessage } from '../exp/embed-message.ts';

export type Message = {
  getAuthorId(): DiscordId;
  matchPlainText(regex: RegExp): Promise<RegExpMatchArray | null>;
  matchCommand(regex: RegExp): Promise<RegExpMatchArray | null>;
  withTyping(callee: () => Promise<boolean>): Promise<boolean>;
  reply(message: string): Promise<void>;
  sendEmbed(embed: EmbedMessage): Promise<void>;
};
