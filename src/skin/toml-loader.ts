import {readFile} from 'fs';

import {SayingLoader} from '../abst/saying-loader';
import {Saying} from '../exp/saying';
import {Analecta} from '../exp/analecta';

export class TomlLoader implements SayingLoader {
  constructor(private filename: string) {}

  async load(): Promise<Saying[]> {
    const read = new Promise((resolve, reject) =>
      readFile(this.filename, (err, data) => {
        if (err) reject(err);
        resolve(data);
      })
    );
    const jsonStr = await read;
    if (typeof jsonStr !== 'string') throw 'file read failure';

    const analecta = JSON.parse(jsonStr);
    if (!Analecta.validateAnalecta(analecta)) throw 'invalid toml';
    return Object.values(analecta);
  }
}
