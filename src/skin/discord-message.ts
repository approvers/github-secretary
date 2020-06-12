import { Message } from 'src/abst/message';
import { Message as RawMessage, MessageEmbed } from 'discord.js';
import { DiscordId } from 'src/exp/github-user';

export class DiscordMessage implements Message {
  constructor(private raw: RawMessage) {}

  getAuthorId(): DiscordId {
    return this.raw.author.id;
  }

  async matchPlainText(regex: RegExp): Promise<RegExpMatchArray | null> {
    return regex.exec(this.raw.content);
  }

  async matchCommand(regex: RegExp): Promise<RegExpMatchArray | null> {
    return regex.exec(this.raw.content.split('\n')[0]);
  }

  async withTyping(callee: () => Promise<boolean>): Promise<boolean> {
    await this.raw.channel.startTyping();
    const res = await callee().finally(() => {
      this.raw.channel.stopTyping();
    });
    return res;
  }

  async reply(message: string): Promise<void> {
    await this.raw.reply(message);
  }

  async sendEmbed(embed: MessageEmbed): Promise<void> {
    await this.raw.channel.send(embed);
  }
}
