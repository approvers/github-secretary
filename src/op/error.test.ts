import { assertEquals } from 'https://deno.land/std/testing/asserts.ts';

import { error } from './error.ts';
import { analectaForTest } from '../skin/test-analecta.ts';
import { MockMessage } from '../skin/mock-message.ts';

Deno.test('show error message', async () => {
  const analecta = analectaForTest;
  const message = new MockMessage('/gh help');
  assertEquals(await error(analecta, message), true);
});

Deno.test('no response', async () => {
  const analecta = analectaForTest;
  const message = new MockMessage('Hello');
  assertEquals(await error(analecta, message), false);
});
