import type { EmbedMessage } from "src/bot/model/message";
import { MockMessage } from "../../../adaptors/mock/message";
import { analectaForTest } from "../../../adaptors/mock/test-analecta";
import { bringBranch } from "./branch";
import { colorFromState } from "../../../model/state-color";

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
  fetchABranch: () =>
    Promise.resolve({
      name: "hotfix",
      _links: { html: "https://github.com/andy/test-project/tree/hotfix" },
      commit: {
        author: {
          // eslint-disable-next-line camelcase
          avatar_url: "https://github.com/bob.png",
          login: "Bob",
        },
      },
    }),
  fetchBranches: () =>
    Promise.resolve([
      {
        name: "hotfix",
      },
    ]),
};

test("get branches list", async () => {
  const analecta = await analectaForTest();

  const message = new MockMessage("/ghb andy/test-project");
  message.emitter.on("sendEmbed", (embed: EmbedMessage) => {
    expect(embed).toStrictEqual({
      color: colorFromState("open"),
      author: {
        name: "Andy",
        iconUrl: "https://github.com/andy.png",
        url: "https://github.com/andy",
      },
      url: "https://github.com/andy/test-project",
      title: "test-project",
      footer: analecta.EnumBranch,
      fields: [
        {
          name: "01",
          value: "[hotfix](https://github.com/andy/test-project/tree/hotfix)",
        },
      ],
    });
  });

  await expect(bringBranch(query, analecta)(message)).resolves.toEqual(true);
});

test("get a branch", async () => {
  const analecta = await analectaForTest();

  const message = new MockMessage("/ghb andy/test-project hotfix");
  message.emitter.on("sendEmbed", (embed: EmbedMessage) => {
    expect(embed).toStrictEqual({
      color: colorFromState("open"),
      author: {
        name: "Bob",
        iconUrl: "https://github.com/bob.png",
        url: "https://github.com/bob",
      },
      url: "https://github.com/andy/test-project/tree/hotfix",
      title: "hotfix",
      footer: analecta.BringBranch,
    });
  });

  await expect(bringBranch(query, analecta)(message)).resolves.toEqual(true);
});
