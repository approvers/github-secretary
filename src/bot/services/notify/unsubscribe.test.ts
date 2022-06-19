import { MockUserDB, placeholder } from "../../adaptors/mock/user-db.js";
import { DiscordId } from "../../model/discord-id.js";
import { MockMessage } from "../../adaptors/mock/message.js";
import { Scheduler } from "../../runners/scheduler.js";
import { analectaForTest } from "../../adaptors/mock/test-analecta.js";
import { unsubNotification } from "./unsubscribe.js";

test("subscribe a member", async () => {
  const analecta = await analectaForTest();
  const db = new MockUserDB();
  const unregisterDone = new Promise<void>((resolve) => {
    db.onUnregister.on(placeholder, (id) => {
      expect(id).toStrictEqual("alice_discord");
      resolve();
    });
  });

  const scheduler = new Scheduler();
  const proc = unsubNotification(db, analecta, scheduler);

  const message = new MockMessage("/ghu", "alice_discord" as DiscordId);
  await expect(proc(message)).resolves.toEqual(true);
  await unregisterDone;
  scheduler.killAll();
});
