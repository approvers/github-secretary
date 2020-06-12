import { MessageEmbed } from 'discord.js';

import { notify } from './notify';
import { analectaForTest } from '../../skin/test-analecta';

test('emit a notification', async (done) => {
  const analecta = await analectaForTest();

  expect(
    notify(
      analecta,
      async (message) => {
        expect(message).toEqual(
          new MessageEmbed()
            .addFields([
              {
                name: '#0123456789',
                value: 'An Issue',
              },
            ])
            .setTitle(analecta.BringIssue)
            .setURL(`https://github.com/notifications`),
        );
        done();
      },
      {
        getUser: async () => ({
          userName: 'Alice',
          notificationToken: 'TEST_TOKEN',
          currentNotificationIds: [],
        }),
        update: async (ids) => {
          expect(ids).toEqual(['0123456789']);
        },
      },
      {
        fetchNotification: async () => [
          {
            id: '0123456789',
            subject: {
              title: 'An Issue',
            },
          },
        ],
      },
    ),
  ).resolves.toEqual(undefined);
});
