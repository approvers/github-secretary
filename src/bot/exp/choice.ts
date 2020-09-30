const negativePositiveOffset = 0.5;

export const choice = (list: readonly string[]): string =>
  [...list].sort(() => Math.random() - negativePositiveOffset)[0];
