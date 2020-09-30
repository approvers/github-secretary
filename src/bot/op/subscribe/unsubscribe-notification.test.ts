import { DiscordId } from "../../exp/discord-id";
import { MockMessage } from "../../skin/mock-message";
import { analectaForTest } from "../../skin/test-analecta";
import { unsubNotification } from "./unsubscribe-notification";

test("subscribe a member", async (done) => {
  const analecta = await analectaForTest();

  const proc = unsubNotification({
    unregister: (id) => {
      expect(id).toStrictEqual("alice_discord");
      done();
      return Promise.resolve(true);
    },
  });

  const message = new MockMessage("/ghu", "alice_discord" as DiscordId);
  await expect(proc(analecta, message)).resolves.toEqual(true);
});
