import { Analecta } from "../exp/analecta.ts";

export type SayingLoader = {
  load(): Promise<Analecta>;
};
