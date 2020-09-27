import { MessageEmbed } from "discord.js";

import { MockMessage } from "../../skin/mock-message";
import { analectaForTest } from "../../skin/test-analecta";
import { bringRepo } from "./repo";

test("get a repository", async (done) => {
  const analecta = await analectaForTest();

  const message = new MockMessage("/ghr andy/test-project");
  message.emitter.on("reply", () => {
    expect("").toStrictEqual("`bringRepo` must not reply.");
    done();
  });
  message.emitter.on("sendEmbed", (embed: MessageEmbed) => {
    expect(embed).toStrictEqual(
      new MessageEmbed()
        .setAuthor(
          "Andy",
          "https://github.com/andy.png",
          "https://github.com/andy"
        )
        .setURL("https://github.com/andy/test-project")
        .setDescription("")
        .setTitle("test-project")
        .setFooter(analecta.BringRepo)
    );
    done();
  });

  await expect(
    bringRepo({
      fetchRepo: () => Promise.resolve({
        name: "test-project",
        html_url: "https://github.com/andy/test-project",
        owner: {
          avatar_url: "https://github.com/andy.png",
          html_url: "https://github.com/andy",
          login: "Andy",
        },
      }),
    })(analecta, message)
  ).resolves.toEqual(true);
});
