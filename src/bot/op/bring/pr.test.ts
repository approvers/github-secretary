import { MessageEmbed } from "discord.js";
import { MockMessage } from "../../skin/mock-message";
import { analectaForTest } from "../../skin/test-analecta";
import { bringPR } from "./pr";
import { colorFromState } from "../../exp/state-color";

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
  fetchAPullRequest: () =>
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
  fetchPullRequests: () =>
    Promise.resolve([
      {
        // eslint-disable-next-line camelcase
        html_url: "https://github.com/test-peoject/issues/1",
        title: "I have an issue",
        number: 1,
      },
    ]),
};

test("get PRs list", async (done) => {
  const analecta = await analectaForTest();

  const message = new MockMessage("/ghp andy/test-project");
  message.emitter.on("reply", () => {
    expect("").toStrictEqual("`bringPR` must not reply.");
    done();
  });
  message.emitter.on("sendEmbed", (embed: MessageEmbed) => {
    expect(embed).toStrictEqual(
      new MessageEmbed()
        .setColor(colorFromState("open"))
        .setAuthor(
          "Andy",
          "https://github.com/andy.png",
          "https://github.com/andy",
        )
        .setURL("https://github.com/andy/test-project")
        .setTitle("test-project")
        .setFooter(analecta.EnumPR)
        .addFields([
          {
            name: "#1",
            value:
              "[I have an issue](https://github.com/test-peoject/issues/1)",
          },
        ]),
    );
    done();
  });

  await expect(bringPR(query)(analecta, message)).resolves.toEqual(true);
});

test("get an issue", async (done) => {
  const analecta = await analectaForTest();

  const message = new MockMessage("/ghp andy/test-project/1");
  message.emitter.on("reply", () => {
    expect("").toStrictEqual("`bringIssue` must not reply.");
    done();
  });
  message.emitter.on("sendEmbed", (embed: MessageEmbed) => {
    expect(embed).toStrictEqual(
      new MessageEmbed()
        .setColor(colorFromState("open"))
        .setAuthor("Bob", "https://github.com/bob.png")
        .setURL("https://github.com/test-peoject/issues/1")
        .setDescription("")
        .setTitle("I have an issue")
        .setFooter(analecta.BringPR),
    );
    done();
  });

  await expect(bringPR(query)(analecta, message)).resolves.toEqual(true);
});
