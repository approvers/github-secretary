import {
  TextChannel,
  Message as RawMessage,
  Client,
  DMChannel,
} from "../../deps.ts";
import { Message } from "../abst/message.ts";
import { DiscordId } from "../exp/discord-id.ts";
import { EmbedMessage } from "../exp/embed-message.ts";

export class DiscordMessage implements Message {
  constructor(private raw: RawMessage, private client: Client) {}

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
    // `Trigger Typing Indicator` expires after 10 seconds
    const triggerTimer = setInterval(() => {
      this.client.postTypingIndicator(this.raw.channel.id);
    }, 9000);

    try {
      return await callee();
    } finally {
      clearInterval(triggerTimer);
    }
  }

  async reply(message: string): Promise<void> {
    if (this.raw.channel instanceof DMChannel) {
      this.raw.channel.createMessage(message);
      return;
    }
    await this.raw.channel.createMessage(
      `<@${this.raw.author.id}> ${message}`,
    );
  }

  async sendEmbed(embed: EmbedMessage): Promise<void> {
    await this.client.createMessage(
      this.raw.channel.id,
      { embed: embed.raw() },
    );
  }
}
