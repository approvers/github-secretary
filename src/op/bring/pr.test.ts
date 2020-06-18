import { bringPR } from './pr.ts';
import { MockMessage } from '../../skin/mock-message.ts';
import { analectaForTest } from '../../skin/test-analecta.ts';
import { colorFromState } from '../../exp/state-color.ts';
import { EmbedMessage } from '../../exp/embed-message.ts';

test('get PRs list', async (done) => {
  const analecta = await analectaForTest();

  const message = new MockMessage('/ghp andy/test-project');
  message.emitter.on('reply', () => {
    expect('').toStrictEqual('`bringPR` must not reply.');
    done();
  });
  message.emitter.on('sendEmbed', (embed: EmbedMessage) => {
    expect(embed).toStrictEqual(
      new EmbedMessage()
        .color(colorFromState('open'))
        .author({
          name: 'Andy',
          icon_url: 'https://github.com/andy.png',
          url: 'https://github.com/andy',
        })
        .url('https://github.com/andy/test-project')
        .title('test-project')
        .footer({ text: analecta.EnumPR })
        .field({
          name: '#1',
          value: '[I have an issue](https://github.com/test-peoject/issues/1)',
        }),
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

test('get an issue', async (done) => {
  const analecta = await analectaForTest();

  const message = new MockMessage('/ghp andy/test-project/1');
  message.emitter.on('reply', () => {
    expect('').toStrictEqual('`bringIssue` must not reply.');
    done();
  });
  message.emitter.on('sendEmbed', (embed: EmbedMessage) => {
    expect(embed).toStrictEqual(
      new EmbedMessage()
        .color(colorFromState('open'))
        .author({ name: 'Bob', icon_url: 'https://github.com/bob.png' })
        .url('https://github.com/test-peoject/issues/1')
        .description('')
        .title('I have an issue')
        .footer({ text: analecta.BringPR }),
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
