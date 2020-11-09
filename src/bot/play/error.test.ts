import { MockMessage } from "../skin/mock-message";
import { analectaForTest } from "../skin/test-analecta";
import { error } from "./error";

test("show error message", async (done) => {
  const analecta = await analectaForTest();
  const message = new MockMessage("/gh help");
  expect(await error(analecta, message)).toEqual(true);
  done();
});

test("no response", async (done) => {
  const analecta = await analectaForTest();
  const message = new MockMessage("Hello");
  expect(await error(analecta, message)).toEqual(false);
  done();
});
