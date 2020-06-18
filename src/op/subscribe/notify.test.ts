import { notify } from './notify.ts';
import { analectaForTest } from '../../skin/test-analecta.ts';
import { GitHubUser } from '../../exp/github-user.ts';
import { NotificationId, GitHubNotifications } from '../../exp/github-notification.ts';
import { EmbedMessage } from '../../exp/embed-message.ts';

test('emit a notification', async (done) => {
  const analecta = await analectaForTest();

  expect(
    notify(
      analecta,
      async (message) => {
        expect(message).toEqual(
          new EmbedMessage()
            .field({
              name: '#0123456789',
              value: 'An Issue',
            })
            .title(analecta.BringIssue)
            .url(`https://github.com/notifications`),
        );
        done();
      },
      {
        getUser: async () =>
          ({
            userName: 'Alice',
            notificationToken: 'TEST_TOKEN',
            currentNotificationIds: [] as NotificationId[],
          } as GitHubUser),
        update: async (ids) => {
          expect(ids).toEqual(['0123456789']);
        },
      },
      {
        fetchNotification: async () =>
          [
            {
              id: '0123456789',
              subject: {
                title: 'An Issue',
              },
            },
          ] as GitHubNotifications,
      },
    ),
  ).resolves.toEqual(undefined);
});
