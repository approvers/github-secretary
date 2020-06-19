import { assertEquals } from 'https://deno.land/std/testing/asserts.ts';

import { analectaForTest } from '../skin/test-analecta.ts';
import { MockMessage } from '../skin/mock-message.ts';
import { flavor } from './flavor.ts';

Deno.test('simple action', async () => {
  const analecta = analectaForTest;
  const message = new MockMessage('らふぃ');
  const proc = flavor(/らふぃ/, /$^/);

  assertEquals(await proc(analecta, message), true);
});

Deno.test('no action', async () => {
  const analecta = analectaForTest;
  const message = new MockMessage('呼んでないよ');
  const proc = flavor(/らふぃ/, /$^/);

  assertEquals(await proc(analecta, message), false);
});
