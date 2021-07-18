import { MockDB, placeholder } from "../../skin/mock-db";
import { DiscordId } from "../../exp/discord-id";
import { MockMessage } from "../../skin/mock-message";
import { analectaForTest } from "../../skin/test-analecta";
import { unsubNotification } from "./unsubscribe-notification";

test("subscribe a member", async () => {
  const analecta = await analectaForTest();
  const db = new MockDB();
  const unregisterDone = new Promise<void>((resolve) => {
    db.onUnregister.on(placeholder, (id) => {
      expect(id).toStrictEqual("alice_discord");
      resolve();
    });
  });

  const proc = unsubNotification(db);

  const message = new MockMessage("/ghu", "alice_discord" as DiscordId);
  await expect(proc(analecta, message)).resolves.toEqual(true);
  await unregisterDone;
});
