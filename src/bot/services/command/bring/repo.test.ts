import { expect, expect, it } from "vitest";
import type { EmbedMessage } from "src/bot/model/message.js";
import { MockMessage } from "../../../adaptors/mock/message.js";
import { analectaForTest } from "../../../adaptors/mock/test-analecta.js";
import { bringRepo } from "./repo.js";

const query = {
  fetchRepo: () =>
    Promise.resolve({
      name: "test-project",
      // eslint-disable-next-line camelcase
      html_url: "https://github.com/andy/test-project",
      owner: {
        // eslint-disable-next-line camelcase
        avatar_url: "https://github.com/andy.png",
        // eslint-disable-next-line camelcase
        html_url: "https://github.com/andy",
        login: "Andy",
      },
    }),
};
it("get a repository", async () => {
  const analecta = await analectaForTest();

  const message = new MockMessage("/ghr andy/test-project");
  message.emitter.on("sendEmbed", (embed: EmbedMessage) => {
    expect(embed).toStrictEqual({
      author: {
        name: "Andy",
        iconUrl: "https://github.com/andy.png",
        url: "https://github.com/andy",
      },
      description: "",
      footer: analecta.BringRepo,
      title: "test-project",
    });
  });

  await expect(bringRepo(query, analecta)(message)).resolves.toEqual(true);
});
