export const omitBody = (body: string): string =>
  body.length >= 80 ? body.slice(0, 80) + "..." : body;
