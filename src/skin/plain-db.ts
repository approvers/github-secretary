import { UserDatabase } from '../op/register-notification';
import { GitHubUser, DiscordId, GitHubUsers } from '../exp/github-user';
import { promises } from 'fs';
import MutexPromise from 'mutex-promise';

const { open } = promises;

export class PlainDB implements UserDatabase {
  private users: GitHubUsers = {};
  private mutex: MutexPromise;

  constructor(fileName: string, private handle: promises.FileHandle) {
    this.mutex = new MutexPromise(`plain-db-${fileName}`);
  }

  static async make(fileName: string): Promise<PlainDB> {
    const handle = await open(fileName, 'w+');
    return new PlainDB(fileName, handle);
  }

  register = async (id: DiscordId, user: GitHubUser): Promise<void> => {
    this.users[id] = user;
    await this.mutex
      .promise()
      .then(() => this.handle.write(JSON.stringify({ users: this.users }), 0)); // for overwrite
  };
}
