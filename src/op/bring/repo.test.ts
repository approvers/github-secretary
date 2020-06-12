import { MessageEmbed } from 'discord.js';

import { MockMessage } from '../../skin/mock-message';
import { TomlLoader } from '../../skin/toml-loader';
import { bringRepo } from './repo';

async function readyAnalecta() {
  const loader = new TomlLoader(process.env.TOML_PATH || './example/laffey.toml');
  const analecta = await loader.load();
  return analecta;
}

test('get a repository', async (done) => {
  const analecta = await readyAnalecta();

  const message = new MockMessage('/ghr andy/test-project');
  message.emitter.on('reply', () => {
    expect('').toStrictEqual('`bringPR` must not reply.');
    done();
  });
  message.emitter.on('sendEmbed', (embed: MessageEmbed) => {
    expect(embed).toStrictEqual(
      new MessageEmbed()
        .setAuthor('Andy', 'https://github.com/andy.png', 'https://github.com/andy')
        .setURL('https://github.com/andy/test-project')
        .setDescription('')
        .setTitle('test-project')
        .setFooter(analecta.Subscribe),
    );
    done();
  });

  expect(
    bringRepo({
      fetchRepo: async () => ({
        name: 'test-project',
        html_url: 'https://github.com/andy/test-project',
        owner: {
          avatar_url: 'https://github.com/andy.png',
          html_url: 'https://github.com/andy',
          login: 'Andy',
        },
      }),
    })(analecta, message),
  ).resolves.toEqual(true);
});
