export function getRandomNumber(max = 1, min = 0) {
  if (arguments.length === 1) min = 0;
  if (min > max) [min, max] = [max, min];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function replaceSpaces(string: string, replaceString = '_') {
  return string.replace(/ /g, replaceString);
}

export function formatFileSize(bytes: number, si = false, decimalPlaces = 1) {
  const threshold = si ? 1000 : 1024;
  if (Math.abs(bytes) < threshold) return `${bytes} B`;
  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  const round = 10 ** decimalPlaces;
  let unitIndex = -1;
  while (Math.round(Math.abs(bytes) * round) / round >= threshold && unitIndex < units.length - 1) {
    bytes /= threshold;
    unitIndex++;
  }

  return `${bytes.toFixed(decimalPlaces)} ${units[unitIndex]}`;
}

export function getLocalStorageSize(...keys: string[]) {
  let totalSize = 0;
  for (const key of keys) {
    const item = localStorage.getItem(key);
    if (!item) continue;
    totalSize += (item.length + key.length) * 2;
  }
  return totalSize;
}
