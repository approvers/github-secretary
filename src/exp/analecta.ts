const AnalectaKeyArray = [
  'Subscribe',
  'Unsubscribe',
  'NotSubscribed',
  'MarkAsRead',
  'BringIssue',
  'BringPR',
  'BringRepo',
  'NothingToBring',
  'EnumIssue',
  'EnumPR',
  'InvalidToken',
  'CallPattern',
  'BlackPattern',
  'HelpMessage',
  'ErrorMessage',
] as const;

export type AnalectaKey = typeof AnalectaKeyArray[number];

export type Analecta = Record<AnalectaKey, string> & {
  Failure: string[];
  Flavor: string[];
};

export const validateAnalecta = (obj: unknown): obj is Analecta => {
  if (typeof obj !== 'object' || obj == null) {
    return false;
  }

  for (const value of AnalectaKeyArray) {
    if (!(value in obj)) {
      console.error(`${value} is not in ${JSON.stringify(obj)}`);
      return false;
    }
  }
  return true;
};
