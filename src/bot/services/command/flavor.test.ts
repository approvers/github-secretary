import { MockMessage } from "../../adaptors/mock/message";
import { analectaForTest } from "../../adaptors/mock/test-analecta";
import { flavor } from "./flavor";

test("simple action", async () => {
  const analecta = await analectaForTest();
  const message = new MockMessage("らふぃ");
  const proc = flavor(/らふぃ/u, /$^/u, analecta);

  expect(await proc(message)).toEqual(true);
});

test("no action", async () => {
  const analecta = await analectaForTest();
  const message = new MockMessage("呼んでないよ");
  const proc = flavor(/らふぃ/u, /$^/u, analecta);

  expect(await proc(message)).toEqual(false);
});
