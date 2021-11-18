const bodyWidth = 80;

export const omitBody = (body: string): string => {
  if (body.length < bodyWidth) {
    return body;
  }
  const omitted = body.slice(0, bodyWidth);
  return `${omitted}...`;
};
