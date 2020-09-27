import { Analecta } from "../exp/analecta";
import { TomlLoader } from "./toml-loader";

export const analectaForTest = async (): Promise<Analecta> => {
  const loader = new TomlLoader("./analecta/laffey.toml");
  const analecta = await loader.load();
  return analecta;
};
