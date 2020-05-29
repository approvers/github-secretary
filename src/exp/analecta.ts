const AnalectaKeyArray = [
  'Subscribe',
  'Unsubscribe',
  'BringIssue',
  'BringPR',
  'EnumIssue',
  'EnumPR',
] as const;

export type AnalectaKey = typeof AnalectaKeyArray[number];

export type Analecta = Record<AnalectaKey, string> & {
  Failure: string[];
  Flavor: string[];
  CallPattern: string;
};

export const validateAnalecta = (obj: unknown): obj is Analecta => {
  if (typeof obj !== 'object' || obj == null) return false;
  for (const value of AnalectaKeyArray) {
    if (!(value in obj)) {
      return false;
    }
  }
  return true;
};
