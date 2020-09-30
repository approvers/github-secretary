import type {
  SubscriptionDatabase,
  UpdateHandler,
  UserDatabase,
} from "../op/interfaces";
import type { DiscordId } from "../exp/discord-id";
import type { GitHubUser } from "../exp/github-user";
import type { NotificationId } from "../exp/github-notification";
import pgPromise from "pg-promise";

const pg = pgPromise();

export class PostgreDB implements SubscriptionDatabase, UserDatabase {
  private constructor(password: string, private db = pg({ password })) {}

  static async make(databasePassword?: string): Promise<PostgreDB> {
    const obj = new PostgreDB(databasePassword || "*******");
    await obj.db.connect();
    await obj.db.none(`
      CREATE TABLE IF NO EXISTS users (
        id text,
        name text NOT NULL,
        token text NOT NULL,
        PRIMARY KEY (id)
      );
      CREATE TABLE IF NO EXISTS notifications (
        userId text REFERENCES users ON DELETE CASCADE,
        notificationId text,
        PRIMARY KEY (notification_id)
      );
    `);
    return obj;
  }

  private handlers: UpdateHandler[] = [];

  onUpdate(handler: UpdateHandler): void {
    this.handlers.push(handler);
  }

  private notify(discordId: DiscordId, user: Readonly<GitHubUser>) {
    this.handlers.forEach((handler) => handler.handleUpdate(discordId, user));
  }

  async register(id: DiscordId, user: GitHubUser): Promise<void> {
    const { userName, notificationToken } = user;
    await this.db.none(
      `
        INSERT INTO
          users (id, name. token)
        VALUES
          ($1, $2, $3)
        ;
      `,
      [id, userName, notificationToken],
    );
    this.notify(id, user);
  }

  async update(
    id: DiscordId,
    notificationIds: NotificationId[],
  ): Promise<void> {
    const set = new pg.helpers.ColumnSet(["userId", "notificationId"], {
      table: "notifications",
    });
    const query = pg.helpers.insert(
      notificationIds.map((notificationId) => [id, notificationId]),
      set,
    );
    await this.db.none(
      `
        DELETE FROM
          notifications
        WHERE
          userId = $1
        ;
      `,
      id,
    );
    await this.db.none(query);
    const { name, token } = (await this.db.one(
      `
        SELECT
          name, token
        FROM
          users
        WHERE
          id = $1
        ;
      `,
      id,
    )) as { name: string; token: string };
    this.notify(id, {
      userName: name,
      notificationToken: token,
      currentNotificationIds: notificationIds,
    } as GitHubUser);
  }

  async unregister(id: DiscordId): Promise<boolean> {
    try {
      await this.db.none(
        `
          DELETE FROM
            users
          WHERE
            id = $1
          ;
        `,
        id,
      );
    } catch (err) {
      return false;
    }
    this.handlers.forEach((handler) => handler.handleDelete(id));
    return true;
  }

  async fetchUser(discordId: DiscordId): Promise<GitHubUser | undefined> {
    const row = (await this.db.oneOrNone(
      `
        SELECT
          id, name, token
        FROM
          users
        WHERE
          id = $1
        ;
      `,
      discordId,
    )) as { id: string; name: string; token: string } | null | undefined;
    // eslint-disable-next-line no-eq-null, eqeqeq
    if (row == null) {
      // eslint-disable-next-line no-undefined
      return undefined;
    }
    const rows = (await this.db.manyOrNone(
      `
        SELECT
          userId,
          notificationId
        FROM
          notifications
        WHERE
          userId = $1
        ;
      `,
      discordId,
    )) as { userId: string; notificationId: string }[];

    const { name, token } = row;
    const notificationIds = rows.map(({ notificationId }) => notificationId);
    return {
      userName: name,
      notificationToken: token,
      currentNotificationIds: notificationIds,
    } as GitHubUser;
  }
}
