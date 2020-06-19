import { assert, assertEquals } from 'https://deno.land/std/testing/asserts.ts';

import { bringIssue } from './issue.ts';
import { analectaForTest } from '../../skin/test-analecta.ts';
import { MockMessage } from '../../skin/mock-message.ts';
import { colorFromState } from '../../exp/state-color.ts';
import { EmbedMessage } from '../../exp/embed-message.ts';

Deno.test('get issues list', async () => {
  const analecta = analectaForTest;

  const message = new MockMessage('/ghi andy/test-project');
  message.replyEvent.attach(() => {
    assert(false, '`bringIssue` must not reply.');
  });
  message.sendEmbedEvent.attach((embed: EmbedMessage) => {
    assertEquals(
      embed,
      new EmbedMessage()
        .color(colorFromState('open'))
        .author({
          name: 'Andy',
          icon_url: 'https://github.com/andy.png',
          url: 'https://github.com/andy',
        })
        .url('https://github.com/andy/test-project')
        .title('test-project')
        .footer({ text: analecta.EnumIssue })
        .field({
          name: '#1',
          value: '[I have an issue](https://github.com/test-peoject/issues/1)',
        }),
    );
  });

  assertEquals(
    await bringIssue({
      fetchRepo: async () => ({
        name: 'test-project',
        html_url: 'https://github.com/andy/test-project',
        owner: {
          avatar_url: 'https://github.com/andy.png',
          html_url: 'https://github.com/andy',
          login: 'Andy',
        },
      }),
      fetchAnIssue: async () => ({
        state: 'open',
        title: 'I have an issue',
        html_url: 'https://github.com/test-peoject/issues/1',
        user: { avatar_url: 'https://github.com/bob.png', login: 'Bob' },
      }),
      fetchIssues: async () => [
        {
          html_url: 'https://github.com/test-peoject/issues/1',
          title: 'I have an issue',
          number: '1',
        },
      ],
    })(analecta, message),
    true,
  );
});

Deno.test('get an issue', async () => {
  const analecta = analectaForTest;

  const message = new MockMessage('/ghi andy/test-project/1');
  message.replyEvent.attach(() => {
    assertEquals('', '`bringIssue` must not reply.');
  });
  message.sendEmbedEvent.attach((embed: EmbedMessage) => {
    assertEquals(
      embed,
      new EmbedMessage()
        .color(colorFromState('open'))
        .author({ name: 'Bob', icon_url: 'https://github.com/bob.png' })
        .url('https://github.com/test-peoject/issues/1')
        .description('')
        .title('I have an issue')
        .footer({ text: analecta.BringIssue }),
    );
  });

  assertEquals(
    await bringIssue({
      fetchRepo: async () => ({
        name: 'test-project',
        html_url: 'https://github.com/andy/test-project',
        owner: {
          avatar_url: 'https://github.com/andy.png',
          html_url: 'https://github.com/andy',
          login: 'Andy',
        },
      }),
      fetchAnIssue: async () => ({
        state: 'open',
        title: 'I have an issue',
        html_url: 'https://github.com/test-peoject/issues/1',
        user: { avatar_url: 'https://github.com/bob.png', login: 'Bob' },
      }),
      fetchIssues: async () => [
        {
          html_url: 'https://github.com/test-peoject/issues/1',
          title: 'I have an issue',
          number: '1',
        },
      ],
    })(analecta, message),
    true,
  );
});
