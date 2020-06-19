import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import { unsubscribeNotification } from "./unsubscribe-notification.ts";
import { MockMessage } from "../../skin/mock-message.ts";
import { analectaForTest } from "../../skin/test-analecta.ts";
import { DiscordId } from "../../exp/discord-id.ts";

Deno.test("subscribe a member", async () => {
  const analecta = analectaForTest;

  const proc = unsubscribeNotification({
    unregister: async (id) => {
      assertEquals(id, "alice_discord");

      return true;
    },
  });

  const message = new MockMessage("/ghu", "alice_discord" as DiscordId);
  assertEquals(await proc(analecta, message), true);
});
