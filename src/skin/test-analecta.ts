import { TomlLoader } from "./toml-loader";
import { Analecta } from "../exp/analecta";

export async function analectaForTest(): Promise<Analecta> {
  const loader = new TomlLoader("./analecta/laffey.toml");
  const analecta = await loader.load();
  return analecta;
}
