import type { DiscordId } from "./discord-id.js";

export interface EmbedMessageField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface EmbedMessage {
  author?: {
    iconUrl?: string;
    name: string;
    url?: string;
  };
  color?: number;
  description?: string;
  fields?: EmbedMessageField[];
  footer?: string;
  title?: string;
  url?: string;
}

export interface Message {
  getAuthorId(): DiscordId;
  matchPlainText(regex: RegExp): Promise<RegExpMatchArray | null>;
  matchCommand(regex: RegExp): Promise<RegExpMatchArray | null>;
  withTyping(callee: () => Promise<boolean>): Promise<boolean>;
  reply(message: string): Promise<void>;
  sendEmbed(embed: EmbedMessage): Promise<void>;
  panic(reason: unknown): never;
}
