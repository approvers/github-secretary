import { unsubscribeNotification } from './unsubscribe-notification.ts';
import { MockMessage } from '../../skin/mock-message.ts';
import { analectaForTest } from '../../skin/test-analecta.ts';
import { DiscordId } from '../../exp/discord-id.ts';

test('subscribe a member', async (done) => {
  const analecta = await analectaForTest();

  const proc = unsubscribeNotification({
    unregister: async (id) => {
      expect(id).toStrictEqual('alice_discord');
      done();
      return true;
    },
  });

  const message = new MockMessage('/ghu', 'alice_discord' as DiscordId);
  expect(proc(analecta, message)).resolves.toEqual(true);
});
