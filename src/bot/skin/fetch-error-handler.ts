import { MessageEmbed } from "discord.js";

const yellow = 0xffc208;

export const fetchErrorHandler = (send: (message: MessageEmbed) => void) => (
  reason: unknown,
): never => {
  send(
    new MessageEmbed()
      .setColor(yellow)
      .setTitle("通知データ取得のエラー発生")
      .setDescription(reason),
  );
  throw reason;
};
