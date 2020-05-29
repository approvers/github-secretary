import { SayingLoader } from '../abst/saying-loader';
import { Analecta } from '../exp/analecta';

export type BuildOutput = {
  present(analecta: Analecta): Promise<void>;
};

export const build = async (loader: SayingLoader, output: BuildOutput): Promise<void> => {
  const analecta = await loader.load();
  await output.present(analecta);
};
