import {Saying} from './saying';

export type Analecta = {
  [key: string]: Saying;
};

export namespace Analecta {
  export const validateAnalecta = (obj: any): obj is Analecta => {
    if (typeof obj !== 'object') return false;
    for (const value of obj) {
      if (!Saying.validateSaying(value)) {
        return false;
      }
    }
    return true;
  };
}
