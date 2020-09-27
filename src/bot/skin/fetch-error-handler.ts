import { MessageEmbed } from "discord.js";

export const fetchErrorHandler = (
  send: (message: MessageEmbed) => void
) => (reason: unknown): never => {
  send(
    new MessageEmbed()
      .setColor(0xffc208)
      .setTitle("通知データ取得のエラー発生")
      .setDescription(reason)
  );
  throw reason;
};
