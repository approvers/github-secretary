import { markAsRead } from './mark-as-read';
import { MockMessage } from '../../skin/mock-message';
import { TomlLoader } from '../../skin/toml-loader';

async function readyAnalecta() {
  const loader = new TomlLoader(process.env.TOML_PATH || './example/laffey.toml');
  const analecta = await loader.load();
  return analecta;
}

test('mark a notification as read', async (done) => {
  const analecta = await readyAnalecta();

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
