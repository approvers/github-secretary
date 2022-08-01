import { expect, it } from "vitest";
import type { EmbedMessage } from "../command.js";
import { MockMessage } from "../../adaptors/mock/message.js";
import { analectaForTest } from "../../adaptors/mock/test-analecta.js";

it("returns a link to create a new issue", async () => {
  const analecta = await analectaForTest();

  const msg = new MockMessage("/ghni andy/test-project");
  msg.emitter.on("sendEmbed", (embed: EmbedMessage) => {
    expect(embed).toStrictEqual({
      url: "https://github.com/andy/test-project/issues/new",
      title: "https://github.com/andy/test-project/issues/new",
      footer: analecta.CreatingIssue,
    });
  });
});
