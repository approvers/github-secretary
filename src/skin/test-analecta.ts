import { TomlLoader } from './toml-loader.ts';
import { Analecta } from '../exp/analecta.ts';

export async function analectaForTest(): Promise<Analecta> {
  const loader = new TomlLoader('./example/laffey.toml');
  const analecta = await loader.load();
  return analecta;
}
