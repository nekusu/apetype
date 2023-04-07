export function getRandomNumber(max = 1, min = 0) {
  if (arguments.length === 1) min = 0;
  if (min > max) [min, max] = [max, min];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function replaceSpaces(string: string, replaceString = '_') {
  return string.replace(/ /g, replaceString);
}

export function toCamelCase(str: string): string {
  return str.replace(/[^a-zA-Z0-9]+(.)/g, (_match, group1: string) => {
    return group1.toUpperCase();
  });
}
