import { unsubscribeNotification } from './unsubscribe-notification';
import { MockMessage } from '../../skin/mock-message';
import { analectaForTest } from '../../skin/test-analecta';

test('subscribe a member', async (done) => {
  const analecta = await analectaForTest();

  const proc = unsubscribeNotification({
    unregister: async (id) => {
      expect(id).toStrictEqual('alice_discord');
      done();
      return true;
    },
  });

  const message = new MockMessage('/ghu', 'alice_discord');
  expect(proc(analecta, message)).resolves.toEqual(true);
});
