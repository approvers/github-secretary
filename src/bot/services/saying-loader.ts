import type { Analecta } from "../model/analecta.js";

export interface SayingLoader {
  load(): Promise<Analecta>;
}
