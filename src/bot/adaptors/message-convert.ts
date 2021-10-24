import type { EmbedMessage } from "../model/message";
import { MessageEmbed } from "discord.js";

export const intoMessageEmbed = ({
  author,
  color,
  description,
  fields,
  footer,
  title,
  url,
}: EmbedMessage): MessageEmbed => {
  const embed = new MessageEmbed();
  if (author) {
    embed.setAuthor(author.name, author.iconUrl, author.url);
  }
  if (color) {
    embed.setColor(color);
  }
  if (description) {
    embed.setDescription(description);
  }
  if (fields) {
    embed.setFields(fields);
  }
  if (footer) {
    embed.setFooter(footer);
  }
  if (title) {
    embed.setTitle(title);
  }
  if (url) {
    embed.setURL(url);
  }
  return embed;
};
