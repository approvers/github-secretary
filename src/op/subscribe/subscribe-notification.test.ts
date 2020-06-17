import { subscribeNotification } from './subscribe-notification';
import { MockMessage } from '../../skin/mock-message';
import { analectaForTest } from '../../skin/test-analecta';

test('subscribe a member', async (done) => {
  const analecta = await analectaForTest();

  const proc = subscribeNotification(
    {
      register: async (id, user) => {
        expect(id).toStrictEqual('alice_discord');
        expect(user).toEqual({
          userName: 'Alice',
          notificationToken: 'TEST_TOKEN',
          currentNotificationIds: [],
        });
        done();
      },
    },
    {
      checkNotificationToken: async () => true,
    },
  );

  const message = new MockMessage('/ghs Alice TEST_TOKEN', 'alice_discord');
  expect(proc(analecta, message)).resolves.toEqual(true);
});
