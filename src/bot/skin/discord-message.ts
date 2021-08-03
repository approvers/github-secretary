import { MessageEmbed, Message as RawMessage } from "discord.js";
import type { DiscordId } from "../exp/discord-id";
import type { Message } from "../abst/message";

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

  async sendEmbed(embed: MessageEmbed): Promise<void> {
    await this.raw.channel.send({ embeds: [embed] });
  }

  panic(reason: unknown): never {
    const yellow = 0xffc208;
    this.sendEmbed(
      new MessageEmbed()
        .setColor(yellow)
        .setTitle("エラー発生, リトライはされません")
        .setDescription(`${reason}`),
    );
    throw reason;
  }
}
