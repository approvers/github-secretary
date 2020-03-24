import {Saying} from '../exp/saying';

export type SayingLoader = {
  load(): Promise<Saying[]>;
};
