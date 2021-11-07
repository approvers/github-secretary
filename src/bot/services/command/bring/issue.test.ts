import type { EmbedMessage } from "src/bot/model/message";
import { MockMessage } from "../../../adaptors/mock/message";
import { analectaForTest } from "../../../adaptors/mock/test-analecta";
import { bringIssue } from "./issue";
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
  fetchAnIssue: () =>
    Promise.resolve({
      state: "open",
      title: "I have an issue",
      number: 1,
      // eslint-disable-next-line camelcase
      html_url: "https://github.com/test-peoject/issues/1",
      user: {
        // eslint-disable-next-line camelcase
        avatar_url: "https://github.com/bob.png",
        login: "Bob",
      },
    }),
  fetchIssues: () =>
    Promise.resolve([
      {
        // eslint-disable-next-line camelcase
        html_url: "https://github.com/test-peoject/issues/1",
        title: "I have an issue",
        number: 1,
      },
    ]),
};

test("get issues list", async () => {
  const analecta = await analectaForTest();

  const message = new MockMessage("/ghi andy/test-project");
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
      footer: analecta.EnumIssue,
      fields: [
        {
          name: "#1",
          value: "[I have an issue](https://github.com/test-peoject/issues/1)",
        },
      ],
    });
  });

  await expect(bringIssue(query, analecta)(message)).resolves.toEqual(true);
});

test("get an issue", async () => {
  const analecta = await analectaForTest();

  const message = new MockMessage("/ghi andy/test-project/1");
  message.emitter.on("sendEmbed", (embed: EmbedMessage) => {
    expect(embed).toStrictEqual({
      color: colorFromState("open"),
      author: {
        name: "Bob",
        iconUrl: "https://github.com/bob.png",
      },
      url: "https://github.com/test-peoject/issues/1",
      description: "",
      title: "I have an issue",
      footer: analecta.BringIssue,
    });
  });

  await expect(bringIssue(query, analecta)(message)).resolves.toEqual(true);
});