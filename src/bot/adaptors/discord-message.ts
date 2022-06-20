import type { EmbedMessage, EmbedPage, Message } from "../model/message.js";
import {
  InteractionCollector,
  MessageComponentInteraction,
  Message as RawMessage,
} from "discord.js";
import { isButtonId, sendPages } from "./pagination.js";
import type { DiscordId } from "../model/discord-id.js";
import { intoMessageEmbed } from "./message-convert.js";

const ONE_MINUTE_MS = 60_000;

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

  sendPages(pages: EmbedPage[]) {
    let paginated: RawMessage | null = null;
    let collector: InteractionCollector<MessageComponentInteraction> | null =
      null;
    return sendPages({
      send: async (message) => {
        paginated = await this.raw.reply(message);
        collector = paginated.createMessageComponentCollector({
          time: ONE_MINUTE_MS,
        });
      },
      onClick: (handler) => {
        collector?.on("collect", (interaction) => {
          if (isButtonId(interaction.customId)) {
            handler(interaction.customId, async (content) => {
              await interaction.update(content);
            });
          }
        });
      },
      onFinish: (handler) => {
        collector?.on("end", () => {
          handler(async (content) => {
            await paginated?.edit(content);
          });
        });
      },
    })(pages);
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
