import { MockMessage } from "../skin/mock-message";
import { analectaForTest } from "../skin/test-analecta";
import { flavor } from "./flavor";

test("simple action", async (done) => {
  const analecta = await analectaForTest();
  const message = new MockMessage("らふぃ");
  const proc = flavor(/らふぃ/u, /$^/u);

  expect(await proc(analecta, message)).toEqual(true);
  done();
});

test("no action", async (done) => {
  const analecta = await analectaForTest();
  const message = new MockMessage("呼んでないよ");
  const proc = flavor(/らふぃ/u, /$^/u);

  expect(await proc(analecta, message)).toEqual(false);
  done();
});
