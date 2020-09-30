import { MessageEmbed } from "discord.js";
import { MockMessage } from "../../skin/mock-message";
import { analectaForTest } from "../../skin/test-analecta";
import { bringRepo } from "./repo";

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
          "https://github.com/andy",
        )
        .setURL("https://github.com/andy/test-project")
        .setDescription("")
        .setTitle("test-project")
        .setFooter(analecta.BringRepo),
    );
    done();
  });

  await expect(bringRepo(query)(analecta, message)).resolves.toEqual(true);
});
