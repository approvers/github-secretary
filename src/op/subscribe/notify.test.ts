import { MessageEmbed } from 'discord.js';

import { notify } from './notify';
import { TomlLoader } from '../../skin/toml-loader';

async function readyAnalecta() {
  const loader = new TomlLoader(process.env.TOML_PATH || './example/laffey.toml');
  const analecta = await loader.load();
  return analecta;
}

test('emit a notification', async (done) => {
  const analecta = await readyAnalecta();

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
