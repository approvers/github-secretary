import { Message as RawMessage, MessageEmbed } from "discord.js";

import { Message } from "../abst/message";
import { DiscordId } from "../exp/discord-id";

export class DiscordMessage implements Message {
  constructor(private raw: RawMessage) {}

  getAuthorId(): DiscordId {
    return this.raw.author.id as DiscordId;
  }

  async matchPlainText(regex: RegExp): Promise<RegExpMatchArray | null> {
    return regex.exec(this.raw.content);
  }

  async matchCommand(regex: RegExp): Promise<RegExpMatchArray | null> {
    return regex.exec(this.raw.content.split("\n")[0]);
  }

  async withTyping(callee: () => Promise<boolean>): Promise<boolean> {
    let res;
    try {
      this.raw.channel.startTyping();
      res = await callee();
    } finally {
      this.raw.channel.stopTyping(true);
    }
    return res;
  }

  async reply(message: string): Promise<void> {
    await this.raw.reply(message);
  }

  async sendEmbed(embed: MessageEmbed): Promise<void> {
    await this.raw.channel.send(embed);
  }
}
