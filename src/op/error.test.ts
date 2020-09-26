import { error } from "./error";
import { analectaForTest } from "../skin/test-analecta";
import { MockMessage } from "../skin/mock-message";

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
