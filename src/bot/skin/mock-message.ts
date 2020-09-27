import { DiscordId } from "../exp/discord-id";
import { EventEmitter } from "events";
import { Message } from "../abst/message";
import { MessageEmbed } from "discord.js";

export class MockMessage implements Message {
  emitter = new EventEmitter();

  constructor(
    private content: string,
    private id: DiscordId = "" as DiscordId,
  ) {}

  getAuthorId(): DiscordId {
    return this.id;
  }

  matchPlainText(regex: RegExp): Promise<RegExpMatchArray | null> {
    return Promise.resolve(regex.exec(this.content));
  }

  matchCommand(regex: RegExp): Promise<RegExpMatchArray | null> {
    return Promise.resolve(regex.exec(this.content.split("\n")[0]));
  }

  withTyping(callee: () => Promise<boolean>): Promise<boolean> {
    return callee();
  }

  reply(message: string): Promise<void> {
    this.emitter.emit("reply", message);
    return Promise.resolve();
  }

  sendEmbed(embed: MessageEmbed): Promise<void> {
    this.emitter.emit("sendEmbed", embed);
    return Promise.resolve();
  }
}
