import { expect, it } from "vitest";
import { MockMessage } from "../../adaptors/mock/message.js";
import { analectaForTest } from "../../adaptors/mock/test-analecta.js";
import { error } from "./error.js";

it("show error message", async () => {
  const analecta = await analectaForTest();
  const message = new MockMessage("/gh help");
  expect(await error(analecta)(message)).toEqual(true);
});

it("no response", async () => {
  const analecta = await analectaForTest();
  const message = new MockMessage("Hello");
  expect(await error(analecta)(message)).toEqual(false);
});
