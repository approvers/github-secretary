import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import { bringBranch } from "./branch.ts";
import { MockMessage } from "../../skin/mock-message.ts";
import { analectaForTest } from "../../skin/test-analecta.ts";
import { colorFromState } from "../../exp/state-color.ts";
import { EmbedMessage } from "../../exp/embed-message.ts";

Deno.test("get branches list", async () => {
  const analecta = analectaForTest;

  const message = new MockMessage("/ghb andy/test-project");
  message.replyEvent.attach(() => {
    throw new Error("`bringBranch` must not reply.");
  });
  message.sendEmbedEvent.attach((embed: EmbedMessage) => {
    assertEquals(
      embed,
      new EmbedMessage()
        .color(colorFromState("open"))
        .author({
          name: "Andy",
          icon_url: "https://github.com/andy.png",
          url: "https://github.com/andy",
        })
        .url("https://github.com/andy/test-project")
        .title("test-project")
        .footer({ text: analecta.EnumBranch })
        .fields(
          {
            name: "01",
            value: "[hotfix](https://github.com/andy/test-project/tree/hotfix)",
          },
        ),
    );
  });

  assertEquals(
    await bringBranch({
      fetchRepo: async () => ({
        name: "test-project",
        html_url: "https://github.com/andy/test-project",
        owner: {
          avatar_url: "https://github.com/andy.png",
          html_url: "https://github.com/andy",
          login: "Andy",
        },
      }),
      fetchABranch: async () => ({
        name: "hotfix",
        _links: { html: "https://github.com/andy/test-project/tree/hotfix" },
        commit: {
          author: { avatar_url: "https://github.com/bob.png", login: "Bob" },
        },
      }),
      fetchBranches: async () => [
        {
          name: "hotfix",
        },
      ],
    })(analecta, message),
    true,
  );
});

Deno.test("get a branch", async () => {
  const analecta = analectaForTest;

  const message = new MockMessage("/ghb andy/test-project hotfix");
  message.replyEvent.attach(() => {
    throw new Error("`bringBranch` must not reply.");
  });
  message.sendEmbedEvent.attach((embed: EmbedMessage) => {
    assertEquals(
      embed,
      new EmbedMessage()
        .color(colorFromState("open"))
        .author({
          name: "Bob",
          icon_url: "https://github.com/bob.png",
          url: "https://github.com/bob",
        })
        .url("https://github.com/andy/test-project/tree/hotfix")
        .title("hotfix")
        .footer({ text: analecta.BringBranch }),
    );
  });

  assertEquals(
    await bringBranch({
      fetchRepo: async () => ({
        name: "test-project",
        html_url: "https://github.com/andy/test-project",
        owner: {
          avatar_url: "https://github.com/andy.png",
          html_url: "https://github.com/andy",
          login: "Andy",
        },
      }),
      fetchABranch: async () => ({
        name: "hotfix",
        _links: { html: "https://github.com/andy/test-project/tree/hotfix" },
        commit: {
          author: { avatar_url: "https://github.com/bob.png", login: "Bob" },
        },
      }),
      fetchBranches: async () => [
        {
          name: "hotfix",
        },
      ],
    })(analecta, message),
    true,
  );
});
