import { MockMessage } from '../../skin/mock-message.ts';
import { analectaForTest } from '../../skin/test-analecta.ts';
import { bringRepo } from './repo.ts';
import { EmbedMessage } from '../../exp/embed-message.ts';

test('get a repository', async (done) => {
  const analecta = await analectaForTest();

  const message = new MockMessage('/ghr andy/test-project');
  message.emitter.on('reply', () => {
    expect('').toStrictEqual('`bringRepo` must not reply.');
    done();
  });
  message.emitter.on('sendEmbed', (embed: EmbedMessage) => {
    expect(embed).toStrictEqual(
      new EmbedMessage()
        .author({
          name: 'Andy',
          icon_url: 'https://github.com/andy.png',
          url: 'https://github.com/andy',
        })
        .url('https://github.com/andy/test-project')
        .description('')
        .title('test-project')
        .footer({ text: analecta.BringRepo }),
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
