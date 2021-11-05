import type { Analecta } from "../model/analecta";

export interface SayingLoader {
  load(): Promise<Analecta>;
}
