export function FmtString<F extends {[key: string]: string}>(
  str: string,
  format: F
): string {
  return str.replace(/\{([0-9A-Za-z]+)\}/g, (match, ...args) => {
    const [p1, index] = args as [string, number];
    if (str[index] === '{' && str[index + match.length]) {
      return p1;
    }
    if (p1 in format) {
      return format[p1];
    }
    return '';
  });
}
