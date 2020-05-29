import { readFile } from 'fs';

import { SayingLoader } from '../abst/saying-loader';
import { Analecta, validateAnalecta } from '../exp/analecta';

export class TomlLoader implements SayingLoader {
  constructor(private filename: string) {}

  async load(): Promise<Analecta> {
    const read = new Promise((resolve, reject) =>
      readFile(this.filename, (err, data) => {
        if (err) reject(err);
        resolve(data);
      }),
    );
    const jsonStr = await read;
    if (typeof jsonStr !== 'string') throw 'file read failure';

    const analecta = JSON.parse(jsonStr);
    if (!validateAnalecta(analecta)) throw 'invalid toml';
    return analecta;
  }
}
