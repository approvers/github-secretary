const AnalectaKeyArray = [
  'Subscribe',
  'Unsubscribe',
  'BringIssue',
  'BringPR',
  'EnumIssue',
  'EnumPR'
] as const;

export type AnalectaKey = typeof AnalectaKeyArray[number];

export type Analecta = Record<AnalectaKey, string> & {
  Failure: string[];
  Flavor: string[];
};

export namespace Analecta {
  export const validateAnalecta = (obj: any): obj is Analecta => {
    if (typeof obj !== 'object') return false;
    for (const value of AnalectaKeyArray) {
      if (!(value in obj)) {
        return false;
      }
    }
    return true;
  };
}
