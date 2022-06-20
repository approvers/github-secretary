import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import type { EmbedPage } from "../model/message.js";
import { intoMessageEmbed } from "./message-convert.js";

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
const DISABLED_CONTROLS = new MessageActionRow().addComponents(
  new MessageButton()
    .setStyle("SECONDARY")
    .setCustomId("prev")
    .setLabel("戻る")
    .setEmoji("⏪")
    .setDisabled(true),
  new MessageButton()
    .setStyle("SECONDARY")
    .setCustomId("next")
    .setLabel("進む")
    .setEmoji("⏩")
    .setDisabled(true),
);

const BUTTON_IDS = ["next", "prev"] as const;

export type ButtonId = typeof BUTTON_IDS[number];

export const isButtonId = (str: string): str is ButtonId =>
  (BUTTON_IDS as readonly string[]).includes(str);

const pagesFooter = (currentPage: number, pagesLength: number) =>
  `ページ ${currentPage + 1}/${pagesLength}`;

const controlsHandler = (
  pagesLength: number,
  generatePage: (index: number) => MessageEmbed,
) => {
  let currentPage = 0;

  return async (buttonId: ButtonId, edit: PageEditor) => {
    switch (buttonId) {
      case "prev":
        if (currentPage > 0) {
          currentPage -= 1;
        } else {
          currentPage = pagesLength - 1;
        }
        break;
      case "next":
        if (currentPage < pagesLength - 1) {
          currentPage += 1;
        } else {
          currentPage = 0;
        }
        break;
      default:
        return;
    }
    await edit({ embeds: [generatePage(currentPage)] });
  };
};

export interface PageEditor {
  (message: {
    embeds?: MessageEmbed[];
    components?: MessageActionRow[];
  }): Promise<void>;
}

export interface PagesSender {
  send(message: {
    embeds: MessageEmbed[];
    components: MessageActionRow[];
  }): Promise<void>;
  onClick(handler: (buttonId: ButtonId, edit: PageEditor) => void): void;
  onFinish(handler: (edit: PageEditor) => void): void;
}

export const sendPages =
  ({ send, onClick, onFinish }: PagesSender) =>
  async (pages: EmbedPage[]) => {
    if (pages.length === 0) {
      throw new Error("pages must not be empty array");
    }

    const generatePage = (index: number) =>
      intoMessageEmbed(pages[index]).setFooter({
        text: pagesFooter(index, pages.length),
      });

    await send({
      embeds: [generatePage(0)],
      components: [CONTROLS],
    });

    onClick(controlsHandler(pages.length, generatePage));
    onFinish((edit) => {
      edit({
        components: [DISABLED_CONTROLS],
      });
    });
  };
