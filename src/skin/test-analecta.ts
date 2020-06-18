import { TomlLoader } from './toml-loader';
import { Analecta } from 'src/exp/analecta';

export async function analectaForTest(): Promise<Analecta> {
  const loader = new TomlLoader('./example/laffey.toml');
  const analecta = await loader.load();
  return analecta;
}
