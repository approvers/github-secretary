import { parse } from 'https://raw.githubusercontent.com/fox-land/deno-toml/master/mod.ts';
import { readFileStr } from 'https://deno.land/std/fs/mod.ts';

import { SayingLoader } from '../abst/saying-loader.ts';
import { Analecta, validateAnalecta } from '../exp/analecta.ts';

export class TomlLoader implements SayingLoader {
  constructor(private filename: string) {}

  async load(): Promise<Analecta> {
    const str = await readFileStr(this.filename);

    const analecta = parse(str);
    if (!validateAnalecta(analecta)) {
      console.log({ analecta });
      throw 'invalid toml';
    }
    return analecta;
  }
}
