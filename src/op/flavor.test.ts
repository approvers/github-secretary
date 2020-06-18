import { analectaForTest } from '../skin/test-analecta.ts';
import { MockMessage } from '../skin/mock-message.ts';
import { flavor } from './flavor.ts';

test('simple action', async (done) => {
  const analecta = await analectaForTest();
  const message = new MockMessage('らふぃ');
  const proc = flavor(/らふぃ/, /$^/);

  expect(await proc(analecta, message)).toEqual(true);
  done();
});

test('no action', async (done) => {
  const analecta = await analectaForTest();
  const message = new MockMessage('呼んでないよ');
  const proc = flavor(/らふぃ/, /$^/);

  expect(await proc(analecta, message)).toEqual(false);
  done();
});
