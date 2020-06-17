import { markAsRead } from './mark-as-read';
import { MockMessage } from '../../skin/mock-message';
import { analectaForTest } from '../../skin/test-analecta';

test('mark a notification as read', async (done) => {
  const analecta = await analectaForTest();

  const proc = markAsRead(
    {
      fetchUser: async (id) => {
        expect(id).toStrictEqual('alice_discord');

        return {
          userName: 'Alice',
          notificationToken: 'TEST_TOKEN',
          currentNotificationIds: ['0123456789'],
        };
      },
    },
    {
      markAsRead: async (_user, id) => {
        expect(id).toStrictEqual('0123456789');
        done();
        return true;
      },
    },
  );

  const message = new MockMessage('/ghm 0123456789', 'alice_discord');
  expect(proc(analecta, message)).resolves.toEqual(true);
});
