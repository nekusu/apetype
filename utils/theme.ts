export interface ThemeInfo {
  name: string;
  bgColor: string;
  mainColor: string;
  subColor: string;
  textColor: string;
}

export interface ThemeColors extends Record<string, string> {
  bg: string;
  main: string;
  caret: string;
  sub: string;
  subAlt: string;
  text: string;
  error: string;
  errorExtra: string;
  colorfulError: string;
  colorfulErrorExtra: string;
}

export interface CustomTheme {
  id: string;
  name: string;
  colors: ThemeColors;
}

export const themeColorVariables: Record<keyof ThemeColors, string> = {
  bg: '--bg-color',
  main: '--main-color',
  caret: '--caret-color',
  sub: '--sub-color',
  subAlt: '--sub-alt-color',
  text: '--text-color',
  error: '--error-color',
  errorExtra: '--error-extra-color',
  colorfulError: '--colorful-error-color',
  colorfulErrorExtra: '--colorful-error-extra-color',
};

export function extractThemeColors(string: string) {
  const regex = /(?<!\/\*.*)(--.+):\s*(.+);/g;
  const matches: RegExpExecArray[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(string)) !== null) matches.push(match);
  return Object.entries(themeColorVariables).reduce((colors, [key, variable]) => {
    const value = matches.find(([, _variable]) => _variable === variable)?.[2];
    colors[key as keyof ThemeColors] = value ?? '';
    return colors;
  }, {} as ThemeColors);
}

export function getThemeColors() {
  const style = getComputedStyle(document.body);
  return Object.entries(themeColorVariables).reduce((variables, [key, value]) => {
    variables[key as keyof typeof themeColorVariables] = style?.getPropertyValue(value) ?? '';
    return variables;
  }, {} as typeof themeColorVariables);
}

export function setThemeColors(colors: ThemeColors, element = document.body) {
  Object.entries(colors).forEach(([key, value]) =>
    element.style.setProperty(themeColorVariables[key as keyof typeof themeColorVariables], value)
  );
}

export function removeThemeColors() {
  Object.entries(themeColorVariables).forEach(([, value]) =>
    document.body.style.removeProperty(value)
  );
}
