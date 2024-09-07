import { colord } from 'colord';
import { camel } from 'radashi';

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
export const themeColorLabels: Record<keyof ThemeColors, string> = {
  bg: 'background',
  main: 'main',
  caret: 'caret',
  sub: 'sub',
  subAlt: 'sub alt',
  text: 'text',
  error: 'error',
  errorExtra: 'error extra',
  colorfulError: 'colorful error',
  colorfulErrorExtra: 'colorful error extra',
};

export function extractThemeColors(string: string) {
  const regex = /(?<!\/\*.*)(--.+):\s*(.+);/g;
  const matches: RegExpExecArray[] = [];
  let match = regex.exec(string);
  while (match !== null) {
    matches.push(match);
    match = regex.exec(string);
  }
  return Object.entries(themeColorVariables).reduce((colors, [key, variable]) => {
    const value = matches.find(([, _variable]) => _variable === variable)?.[2];
    colors[key as keyof ThemeColors] = value ?? '';
    return colors;
  }, {} as ThemeColors);
}

export function getThemeColors() {
  const style = getComputedStyle(document.body);
  return Object.entries(themeColorVariables).reduce(
    (variables, [key, value]) => {
      variables[key as keyof typeof themeColorVariables] = style?.getPropertyValue(value) ?? '';
      return variables;
    },
    {} as typeof themeColorVariables,
  );
}

export function setThemeColors(colors: ThemeColors, element = document.documentElement) {
  for (const [key, value] of Object.entries(colors))
    element.style.setProperty(themeColorVariables[key as keyof typeof themeColorVariables], value);
}

export function validateColor(value = '', colors?: ThemeColors) {
  let color = value;
  const variableRegex = /^var\((--(.*)-color)\)$/;
  const match = value.match(variableRegex);
  if (match) {
    if (colors) color = validateColor(colors[camel(match[2])], colors).color;
    else color = getComputedStyle(document.body).getPropertyValue(match[1]);
  }
  return { color, isValid: colord(color).isValid() };
}
