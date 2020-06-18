import { subscribeNotification } from './subscribe-notification.ts';
import { MockMessage } from '../../skin/mock-message.ts';
import { analectaForTest } from '../../skin/test-analecta.ts';
import { NotificationId } from '../../exp/github-notification.ts';
import { GitHubUser } from '../../exp/github-user.ts';
import { DiscordId } from '../../exp/discord-id.ts';

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
      getGitHubUser: async () =>
        ({
          userName: 'Alice',
          notificationToken: 'TEST_TOKEN',
          currentNotificationIds: [] as NotificationId[],
        } as GitHubUser),
    },
  );

  const message = new MockMessage('/ghs Alice TEST_TOKEN', 'alice_discord' as DiscordId);
  expect(proc(analecta, message)).resolves.toEqual(true);
});
