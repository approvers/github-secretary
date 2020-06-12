import { Message } from 'src/abst/message';
import { EventEmitter } from 'events';
import { DiscordId } from 'src/exp/github-user';
import { MessageEmbed } from 'discord.js';

export class MockMessage implements Message {
  emitter = new EventEmitter();

  constructor(private content: string, private id: DiscordId = '') {}

  getAuthorId(): DiscordId {
    return this.id;
  }

  async matchPlainText(regex: RegExp): Promise<RegExpMatchArray | null> {
    return regex.exec(this.content);
  }

  async matchCommand(regex: RegExp): Promise<RegExpMatchArray | null> {
    return regex.exec(this.content.split('\n')[0]);
  }

  async withTyping(callee: () => Promise<boolean>): Promise<boolean> {
    return callee();
  }

  async reply(message: string): Promise<void> {
    this.emitter.emit('reply', message);
  }

  async sendEmbed(embed: MessageEmbed): Promise<void> {
    this.emitter.emit('sendEmbed', embed);
  }
}
