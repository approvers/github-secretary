import { MessageEmbed } from "discord.js";

import { bringBranch } from "./branch";
import { MockMessage } from "../../skin/mock-message";
import { analectaForTest } from "../../skin/test-analecta";
import { colorFromState } from "../../exp/state-color";

test("get branches list", async (done) => {
  const analecta = await analectaForTest();

  const message = new MockMessage("/ghb andy/test-project");
  message.emitter.on("reply", () => {
    expect("").toStrictEqual("`bringBranch` must not reply.");
    done();
  });
  message.emitter.on("sendEmbed", (embed: MessageEmbed) => {
    expect(embed).toStrictEqual(
      new MessageEmbed()
        .setColor(colorFromState("open"))
        .setAuthor(
          "Andy",
          "https://github.com/andy.png",
          "https://github.com/andy"
        )
        .setURL("https://github.com/andy/test-project")
        .setTitle("test-project")
        .setFooter(analecta.EnumBranch)
        .addFields([
          {
            name: "01",
            value: "[hotfix](https://github.com/andy/test-project/tree/hotfix)",
          },
        ])
    );
    done();
  });

  await expect(
    bringBranch({
      fetchRepo: () => Promise.resolve({
        name: "test-project",
        html_url: "https://github.com/andy/test-project",
        owner: {
          avatar_url: "https://github.com/andy.png",
          html_url: "https://github.com/andy",
          login: "Andy",
        },
      }),
      fetchABranch: () => Promise.resolve({
        name: "hotfix",
        _links: { html: "https://github.com/andy/test-project/tree/hotfix" },
        commit: {
          author: { avatar_url: "https://github.com/bob.png", login: "Bob" },
        },
      }),
      fetchBranches: () => Promise.resolve([
        {
          name: "hotfix",
        },
      ]),
    })(analecta, message)
  ).resolves.toEqual(true);
});

test("get a branch", async (done) => {
  const analecta = await analectaForTest();

  const message = new MockMessage("/ghb andy/test-project hotfix");
  message.emitter.on("reply", () => {
    expect("").toStrictEqual("`bringBranch` must not reply.");
    done();
  });
  message.emitter.on("sendEmbed", (embed: MessageEmbed) => {
    expect(embed).toStrictEqual(
      new MessageEmbed()
        .setColor(colorFromState("open"))
        .setAuthor(
          "Bob",
          "https://github.com/bob.png",
          "https://github.com/bob"
        )
        .setURL("https://github.com/andy/test-project/tree/hotfix")
        .setTitle("hotfix")
        .setFooter(analecta.BringBranch)
    );
    done();
  });

  await expect(
    bringBranch({
      fetchRepo: () => Promise.resolve({
        name: "test-project",
        html_url: "https://github.com/andy/test-project",
        owner: {
          avatar_url: "https://github.com/andy.png",
          html_url: "https://github.com/andy",
          login: "Andy",
        },
      }),
      fetchABranch: () => Promise.resolve({
        name: "hotfix",
        _links: { html: "https://github.com/andy/test-project/tree/hotfix" },
        commit: {
          author: { avatar_url: "https://github.com/bob.png", login: "Bob" },
        },
      }),
      fetchBranches: () => Promise.resolve([
        {
          name: "hotfix",
        },
      ]),
    })(analecta, message)
  ).resolves.toEqual(true);
});
