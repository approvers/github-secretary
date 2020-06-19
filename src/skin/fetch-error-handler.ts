import { EmbedMessage } from "../exp/embed-message.ts";

export const fetchErrorHandler = (
  send: (message: EmbedMessage) => Promise<void>,
) =>
  (
    reason: unknown,
  ): never => {
    send(
      new EmbedMessage()
        .color(0xffc208)
        .title("通知データ取得のエラー発生")
        .description(new String(reason).toString()),
    );
    throw reason;
  };
