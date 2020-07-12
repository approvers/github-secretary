import toml from 'toml';
import { promises } from 'fs';

const { readFile } = promises;

import { SayingLoader } from '../abst/saying-loader';
import { Analecta, validateAnalecta } from '../exp/analecta';

export class TomlLoader implements SayingLoader {
  constructor(private filename: string) {}

  async load(): Promise<Analecta> {
    const buf = await readFile(this.filename);
    const jsonStr = buf.toString();
    if (typeof jsonStr !== 'string') throw 'file read failure';

    const analecta = toml.parse(jsonStr);
    if (!validateAnalecta(analecta)) {
      console.log({ analecta });
      throw 'invalid toml';
    }
    return analecta;
  }
}
