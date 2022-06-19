import type { Analecta } from "../../model/analecta.js";
import { TomlLoader } from "../toml-loader.js";

export const analectaForTest = async (): Promise<Analecta> => {
  const loader = new TomlLoader("./analecta/laffey.toml");
  const analecta = await loader.load();
  return analecta;
};
