import { MessageEmbed } from 'discord.js';

import { bringPR } from './pr';
import { MockMessage } from '../../skin/mock-message';
import { TomlLoader } from '../../skin/toml-loader';
import { colorFromState } from '../../exp/state-color';

test('get PRs list', async (done) => {
  const loader = new TomlLoader(process.env.TOML_PATH || './example/laffey.toml');
  const analecta = await loader.load();

  const message = new MockMessage('/ghp andy/test-project');
  message.emitter.on('reply', () => {
    expect('').toStrictEqual('`bringPR` must not reply.');
    done();
  });
  message.emitter.on('sendEmbed', (embed: MessageEmbed) => {
    expect(embed).toStrictEqual(
      new MessageEmbed()
        .setColor(colorFromState('open'))
        .setAuthor('Andy', 'https://github.com/andy.png', 'https://github.com/andy')
        .setURL('https://github.com/andy/test-project')
        .setTitle('test-project')
        .setFooter(analecta.EnumPR)
        .addFields([
          {
            name: '#1',
            value: '[I have an issue](https://github.com/test-peoject/issues/1)',
          },
        ]),
    );
    done();
  });

  expect(
    bringPR({
      fetchRepo: async () => ({
        name: 'test-project',
        html_url: 'https://github.com/andy/test-project',
        owner: {
          avatar_url: 'https://github.com/andy.png',
          html_url: 'https://github.com/andy',
          login: 'Andy',
        },
      }),
      fetchAPullRequest: async () => ({
        state: 'open',
        title: 'I have an issue',
        html_url: 'https://github.com/test-peoject/issues/1',
        user: { avatar_url: 'https://github.com/bob.png', login: 'Bob' },
      }),
      fetchPullRequests: async () => [
        {
          html_url: 'https://github.com/test-peoject/issues/1',
          title: 'I have an issue',
          number: '1',
        },
      ],
    })(analecta, message),
  ).resolves.toEqual(true);
});
