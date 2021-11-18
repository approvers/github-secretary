import { Analecta, validateAnalecta } from "../model/analecta";
import type { SayingLoader } from "../services/saying-loader";
import { promises } from "fs";
import toml from "toml";

const { readFile } = promises;

export class TomlLoader implements SayingLoader {
  constructor(private filename: string) {}

  async load(): Promise<Analecta> {
    const buf = await readFile(this.filename);
    const tomlStr = buf.toString();
    if (typeof tomlStr !== "string") {
      throw new Error("file read failure");
    }

    const analecta: unknown = toml.parse(tomlStr);
    if (!validateAnalecta(analecta)) {
      console.dir(analecta);
      throw new Error("invalid toml");
    }
    return analecta;
  }
}
