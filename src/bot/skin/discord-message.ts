import { Message as RawMessage, MessageEmbed } from "discord.js";

import { Message } from "../abst/message";
import { DiscordId } from "../exp/discord-id";

export class DiscordMessage implements Message {
  constructor(private raw: RawMessage) {}

  getAuthorId(): DiscordId {
    return this.raw.author.id as DiscordId;
  }

  matchPlainText(regex: RegExp): Promise<RegExpMatchArray | null> {
    return Promise.resolve(regex.exec(this.raw.content));
  }

  matchCommand(regex: RegExp): Promise<RegExpMatchArray | null> {
    return Promise.resolve(regex.exec(this.raw.content.split("\n")[0]));
  }

  async withTyping(callee: () => Promise<boolean>): Promise<boolean> {
    try {
      void this.raw.channel.startTyping();
      return await callee();
    } finally {
      this.raw.channel.stopTyping(true);
    }
  }

  async reply(message: string): Promise<void> {
    await this.raw.reply(message);
  }

  async sendEmbed(embed: MessageEmbed): Promise<void> {
    await this.raw.channel.send(embed);
  }
}
