import { assert, assertEquals } from 'https://deno.land/std/testing/asserts.ts';

import { MockMessage } from '../../skin/mock-message.ts';
import { analectaForTest } from '../../skin/test-analecta.ts';
import { bringRepo } from './repo.ts';
import { EmbedMessage } from '../../exp/embed-message.ts';

Deno.test('get a repository', async () => {
  const analecta = analectaForTest;

  const message = new MockMessage('/ghr andy/test-project');
  message.replyEvent.attach(() => {
    assert(false, '`bringRepo` must not reply.');
  });
  message.sendEmbedEvent.attach((embed: EmbedMessage) => {
    assertEquals(
      embed,
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
  });

  assertEquals(
    await bringRepo({
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
    true,
  );
});
