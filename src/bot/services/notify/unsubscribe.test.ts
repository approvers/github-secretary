import { MockUserDB, placeholder } from "../../adaptors/mock/user-db";
import { DiscordId } from "../../model/discord-id";
import { MockMessage } from "../../adaptors/mock/message";
import { analectaForTest } from "../../adaptors/mock/test-analecta";
import { unsubNotification } from "./unsubscribe";

test("subscribe a member", async () => {
  const analecta = await analectaForTest();
  const db = new MockUserDB();
  const unregisterDone = new Promise<void>((resolve) => {
    db.onUnregister.on(placeholder, (id) => {
      expect(id).toStrictEqual("alice_discord");
      resolve();
    });
  });

  const proc = unsubNotification(db, analecta);

  const message = new MockMessage("/ghu", "alice_discord" as DiscordId);
  await expect(proc(message)).resolves.toEqual(true);
  await unregisterDone;
});
