import type { EmbedMessage, Message } from "../../model/message.js";
import type { DiscordId } from "../../model/discord-id.js";
import { EventEmitter } from "node:events";

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

  sendEmbed(embed: EmbedMessage): Promise<void> {
    this.emitter.emit("sendEmbed", embed);
    return Promise.resolve();
  }

  panic(reason: unknown): never {
    console.error(reason);
    throw reason;
  }
}
