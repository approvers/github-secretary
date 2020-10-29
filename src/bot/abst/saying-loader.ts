import type { Analecta } from "../exp/analecta";

export type SayingLoader = {
  load(): Promise<Analecta>;
};
