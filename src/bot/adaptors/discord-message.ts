import type { EmbedMessage, Message } from "../model/message";
import type { DiscordId } from "../model/discord-id";
import { Message as RawMessage } from "discord.js";
import { intoMessageEmbed } from "./message-convert";

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

  withTyping(callee: () => Promise<boolean>): Promise<boolean> {
    return callee();
  }

  async reply(message: string): Promise<void> {
    await this.raw.reply(message);
  }

  async sendEmbed(embed: EmbedMessage): Promise<void> {
    const messageEmbed = intoMessageEmbed(embed);
    await this.raw.channel.send({ embeds: [messageEmbed] });
  }

  panic(reason: unknown): never {
    const yellow = 0xffc208;
    this.sendEmbed({
      color: yellow,
      title: "エラー発生, リトライはされません",
      description: `${reason}`,
    });
    throw reason;
  }
}
