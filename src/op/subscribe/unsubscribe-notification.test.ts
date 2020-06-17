import { unsubscribeNotification } from './unsubscribe-notification';
import { TomlLoader } from '../../skin/toml-loader';
import { MockMessage } from '../../skin/mock-message';

async function readyAnalecta() {
  const loader = new TomlLoader(process.env.TOML_PATH || './example/laffey.toml');
  const analecta = await loader.load();
  return analecta;
}

test('subscribe a member', async (done) => {
  const analecta = await readyAnalecta();

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
