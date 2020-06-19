import { assertEquals } from 'https://deno.land/std/testing/asserts.ts';

import { markAsRead } from './mark-as-read.ts';
import { MockMessage } from '../../skin/mock-message.ts';
import { analectaForTest } from '../../skin/test-analecta.ts';
import { GitHubUser } from '../../exp/github-user.ts';
import { DiscordId } from '../../exp/discord-id.ts';
import { NotificationId } from '../../exp/github-notification.ts';

Deno.test('mark a notification as read', async () => {
  const analecta = analectaForTest;

  const proc = markAsRead(
    {
      fetchUser: async (id: DiscordId) => {
        assertEquals(id, 'alice_discord');

        return ({
          userName: 'Alice',
          notificationToken: 'TEST_TOKEN',
          currentNotificationIds: ['0123456789' as NotificationId],
        } as unknown) as GitHubUser;
      },
    },
    {
      markAsRead: async (_user: GitHubUser, id: NotificationId) => {
        assertEquals(id, '0123456789');

        return true;
      },
    },
  );

  const message = new MockMessage('/ghm 0123456789', 'alice_discord' as DiscordId);
  assertEquals(await proc(analecta, message), true);
});
