import type { EmbedMessage, EmbedPage, Message } from "../model/message.js";
import {
  MessageActionRow,
  MessageButton,
  Message as RawMessage,
} from "discord.js";
import type { DiscordId } from "../model/discord-id.js";
import { intoMessageEmbed } from "./message-convert.js";

const ONE_MINUTE_MS = 60_000;
const CONTROLS = new MessageActionRow().addComponents(
  new MessageButton()
    .setStyle("SECONDARY")
    .setCustomId("prev")
    .setLabel("戻る")
    .setEmoji("⏪"),
  new MessageButton()
    .setStyle("SECONDARY")
    .setCustomId("next")
    .setLabel("進む")
    .setEmoji("⏩"),
);

const pagesFooter = (currentPage: number, pagesLength: number) =>
  `ページ ${currentPage + 1}/${pagesLength}`;

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

  async sendPages(pages: EmbedPage[]): Promise<void> {
    if (pages.length === 0) {
      throw new Error("pages must not be empty array");
    }

    const generatePage = (index: number) =>
      intoMessageEmbed(pages[index]).setFooter({
        text: pagesFooter(index, pages.length),
      });

    const paginated = await this.raw.reply({
      embeds: [generatePage(0)],
      components: [CONTROLS],
    });

    const collector = paginated.createMessageComponentCollector({
      time: ONE_MINUTE_MS,
    });
    let currentPage = 0;
    collector.on("collect", async (interaction) => {
      switch (interaction.customId) {
        case "prev":
          if (currentPage > 0) {
            currentPage -= 1;
          } else {
            currentPage = pages.length - 1;
          }
          break;
        case "next":
          if (currentPage < pages.length - 1) {
            currentPage += 1;
          } else {
            currentPage = 0;
          }
          break;
        default:
          return;
      }
      await interaction.update({ embeds: [generatePage(currentPage)] });
    });
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
