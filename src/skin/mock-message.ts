import { Evt } from "https://deno.land/x/evt/mod.ts";

import { Message } from "../abst/message.ts";
import { DiscordId } from "../exp/discord-id.ts";
import { EmbedMessage } from "../exp/embed-message.ts";

export class MockMessage implements Message {
  replyEvent = new Evt<string>();
  sendEmbedEvent = new Evt<EmbedMessage>();

  constructor(
    private content: string,
    private id: DiscordId = "" as DiscordId,
  ) {}

  getAuthorId(): DiscordId {
    return this.id;
  }

  async matchPlainText(regex: RegExp): Promise<RegExpMatchArray | null> {
    return regex.exec(this.content);
  }

  async matchCommand(regex: RegExp): Promise<RegExpMatchArray | null> {
    return regex.exec(this.content.split("\n")[0]);
  }

  async withTyping(callee: () => Promise<boolean>): Promise<boolean> {
    return callee();
  }

  async reply(message: string): Promise<void> {
    this.replyEvent.post(message);
  }

  async sendEmbed(embed: EmbedMessage): Promise<void> {
    this.sendEmbedEvent.post(embed);
  }
}
