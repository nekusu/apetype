import { Key } from 'components/core';
import { ReactNode } from 'react';
import { toCamelCase } from './misc';

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

export type Mode = 'time' | 'words';
export type Time = number;
export type Words = number;
export type QuickRestart = false | 'tab' | 'esc';
export type Language = string;
export type QuickEnd = boolean;
export type IndicateTypos = false | 'below' | 'replace';
export type HideExtraLetters = boolean;
export type SmoothCaret = boolean;
export type CaretStyle = false | 'default' | 'block' | 'outline' | 'underline';
export type TimerProgressStyle = 'text' | 'bar' | 'both';
export type StatsColor = 'sub' | 'text' | 'main';
export type StatsOpacity = 0.25 | 0.5 | 0.75 | 1;
export type SmoothLineScroll = boolean;
export type ShowDecimalPlaces = boolean;
export type FontSize = 1 | 1.25 | 1.5 | 2 | 3 | 4;
export type FontFamily = string;
export type PageWidth = '1000px' | '1250px' | '1500px' | '2000px' | '100%';
export type FlipTestColors = boolean;
export type ColorfulMode = boolean;
export type RandomizeTheme = boolean | 'light' | 'dark';
export type ThemeType = 'preset' | 'custom';
export type Theme = string;
export type CustomThemeId = string;
export type LiveWpm = boolean;
export type LiveAccuracy = boolean;
export type TimerProgress = boolean;
export type KeyTips = boolean;
export type OutOfFocusWarning = boolean;
export type CapsLockWarning = boolean;

export interface Settings {
  mode: Mode;
  time: Time;
  words: Words;
  quickRestart: QuickRestart;
  language: Language;
  quickEnd: QuickEnd;
  indicateTypos: IndicateTypos;
  hideExtraLetters: HideExtraLetters;
  smoothCaret: SmoothCaret;
  caretStyle: CaretStyle;
  timerProgressStyle: TimerProgressStyle;
  statsColor: StatsColor;
  statsOpacity: StatsOpacity;
  smoothLineScroll: SmoothLineScroll;
  showDecimalPlaces: ShowDecimalPlaces;
  fontSize: FontSize;
  fontFamily: FontFamily;
  pageWidth: PageWidth;
  flipTestColors: FlipTestColors;
  colorfulMode: ColorfulMode;
  randomizeTheme: RandomizeTheme;
  themeType: ThemeType;
  theme: Theme;
  customThemes: CustomTheme[];
  customThemeId: CustomThemeId;
  liveWpm: LiveWpm;
  liveAccuracy: LiveAccuracy;
  timerProgress: TimerProgress;
  keyTips: KeyTips;
  outOfFocusWarning: OutOfFocusWarning;
  capsLockWarning: CapsLockWarning;
}

export interface SettingParams<T> {
  command: string;
  category?: (typeof categories)[number];
  description?: ReactNode;
  options: { alt?: string; value: T }[];
  custom?: boolean;
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

const OFF_ON_OPTIONS = [
  { alt: 'off', value: false },
  { alt: 'on', value: true },
];
const HIDE_SHOW_OPTIONS = [
  { alt: 'hide', value: false },
  { alt: 'show', value: true },
];

function create<T>(params: SettingParams<T>) {
  return { ...params, id: toCamelCase(params.command) as keyof Settings };
}

export const categories = [
  'behavior',
  'input',
  'sound',
  'caret',
  'appearance',
  'theme',
  'hide elements',
  'danger zone',
] as const;

export const settingsList = {
  mode: create<Mode>({
    command: 'mode',
    options: [{ value: 'time' }, { value: 'words' }],
  }),
  time: create<Time>({
    command: 'time',
    options: [{ value: 15 }, { value: 30 }, { value: 60 }, { value: 120 }],
    custom: true,
  }),
  words: create<Words>({
    command: 'words',
    options: [{ value: 10 }, { value: 25 }, { value: 50 }, { value: 100 }],
    custom: true,
  }),
  quickRestart: create<QuickRestart>({
    command: 'quick restart',
    category: 'behavior',
    description: (
      <>
        Press <Key>tab</Key> or <Key>esc</Key> to quickly restart the test, or to quickly jump to
        the test page. Both options disable tab navigation on most parts of the website. Using the
        &quot;esc&quot; option will move opening the command line to the <Key>tab</Key> key.
      </>
    ),
    options: [
      { alt: 'off', value: false },
      { alt: 'tab', value: 'tab' },
      { alt: 'esc', value: 'esc' },
    ],
  }),
  language: create<Language>({
    command: 'language',
    category: 'behavior',
    description: <>Change in which language you want to type.</>,
    options: [],
  }),
  quickEnd: create<QuickEnd>({
    command: 'quick end',
    category: 'input',
    description: (
      <>
        This only applies to the words mode - when enabled, the test will end as soon as the last
        word has been typed, even if it&apos;s incorrect. When disabled, you need to manually
        confirm the last incorrect entry with a space.
      </>
    ),
    options: OFF_ON_OPTIONS,
  }),
  indicateTypos: create<IndicateTypos>({
    command: 'indicate typos',
    category: 'input',
    description: (
      <>
        Shows typos that you&apos;ve made. Below shows what you typed below the letters and replace
        will replace the letters with the ones you typed.
      </>
    ),
    options: [
      { alt: 'off', value: false },
      { alt: 'below', value: 'below' },
      { alt: 'replace', value: 'replace' },
    ],
  }),
  hideExtraLetters: create<HideExtraLetters>({
    command: 'hide extra letters',
    category: 'input',
    description: (
      <>
        Hides extra letters. This will completely avoid words jumping lines (due to changing width),
        but might feel a bit confusing when you press a key and nothing happens.
      </>
    ),
    options: OFF_ON_OPTIONS,
  }),
  smoothCaret: create<SmoothCaret>({
    command: 'smooth caret',
    category: 'caret',
    description: <>When enabled, the caret will move smoothly between letters and words.</>,
    options: OFF_ON_OPTIONS,
  }),
  caretStyle: create<CaretStyle>({
    command: 'caret style',
    category: 'caret',
    description: <>Change the style of the caret during the test.</>,
    options: [
      { alt: 'off', value: false },
      { alt: '|', value: 'default' },
      { alt: '▮', value: 'block' },
      { alt: '▯', value: 'outline' },
      { alt: '_', value: 'underline' },
    ],
  }),
  timerProgressStyle: create<TimerProgressStyle>({
    command: 'timer/progress style',
    category: 'appearance',
    description: <>Change the style of the timer/progress-bar during a test.</>,
    options: [{ value: 'text' }, { value: 'bar' }, { value: 'both' }],
  }),
  statsColor: create<StatsColor>({
    command: 'stats color',
    category: 'appearance',
    description: <>Change the color of the timer/progress-bar, live wpm, and accuracy stats.</>,
    options: [{ value: 'sub' }, { value: 'text' }, { value: 'main' }],
  }),
  statsOpacity: create<StatsOpacity>({
    command: 'stats opacity',
    category: 'appearance',
    description: <>Change the opacity of the timer/progress-bar, live wpm, and accuracy stats.</>,
    options: [
      { alt: '25%', value: 0.25 },
      { alt: '50%', value: 0.5 },
      { alt: '75%', value: 0.75 },
      { alt: '100%', value: 1 },
    ],
  }),
  smoothLineScroll: create<SmoothLineScroll>({
    command: 'smooth line scroll',
    category: 'appearance',
    description: <>When enabled, the line transition will be animated.</>,
    options: OFF_ON_OPTIONS,
  }),
  showDecimalPlaces: create<ShowDecimalPlaces>({
    command: 'show decimal places',
    category: 'appearance',
    description: <>Always shows decimal places for values on the result page.</>,
    options: OFF_ON_OPTIONS,
  }),
  fontSize: create<FontSize>({
    command: 'font size',
    category: 'appearance',
    description: <>Change the font size of the test words.</>,
    options: [
      { value: 1 },
      { value: 1.25 },
      { value: 1.5 },
      { value: 2 },
      { value: 3 },
      { value: 4 },
    ],
  }),
  fontFamily: create<FontFamily>({
    command: 'font family',
    category: 'appearance',
    options: [
      { alt: 'Fira Code', value: '--font-fira-code' },
      { alt: 'Inconsolata', value: '--font-inconsolata' },
      { alt: 'JetBrains Mono', value: '--font-jetbrains-mono' },
      { alt: 'Lato', value: '--font-lato' },
      { alt: 'Lexend Deca', value: '--font-lexend-deca' },
      { alt: 'Montserrat', value: '--font-montserrat' },
      { alt: 'Nunito', value: '--font-nunito' },
      { alt: 'Oxygen', value: '--font-oxygen' },
      { alt: 'Roboto', value: '--font-roboto' },
      { alt: 'Roboto Mono', value: '--font-roboto-mono' },
      { alt: 'Source Code Pro', value: '--font-source-code-pro' },
      { alt: 'Ubuntu', value: '--font-ubuntu' },
      { alt: 'Ubuntu Mono', value: '--font-ubuntu-mono' },
    ],
    custom: true,
  }),
  pageWidth: create<PageWidth>({
    command: 'page width',
    category: 'appearance',
    description: <>Change the width of the content.</>,
    options: [
      { alt: '100%', value: '1000px' },
      { alt: '125%', value: '1250px' },
      { alt: '150%', value: '1500px' },
      { alt: '200%', value: '2000px' },
      { alt: 'max', value: '100%' },
    ],
  }),
  flipTestColors: create<FlipTestColors>({
    command: 'flip test colors',
    category: 'theme',
    description: (
      <>
        By default, typed text is brighter than the future text. When enabled, the colors will be
        flipped and the future text will be brighter than the already typed text.
      </>
    ),
    options: OFF_ON_OPTIONS,
  }),
  colorfulMode: create<ColorfulMode>({
    command: 'colorful mode',
    category: 'theme',
    description: (
      <>
        When enabled, the test words will use the main color, instead of the text color, making the
        website more colorful.
      </>
    ),
    options: OFF_ON_OPTIONS,
  }),
  randomizeTheme: create<RandomizeTheme>({
    command: 'randomize theme',
    category: 'theme',
    description: (
      <>
        After completing a test, the theme will be set to a random one. If set to &apos;light&apos;
        or &apos;dark&apos;, only presets with light or dark background colors will be randomized,
        respectively.
      </>
    ),
    options: [...OFF_ON_OPTIONS, { value: 'light' }, { value: 'dark' }],
  }),
  theme: create<Theme>({
    command: 'theme',
    category: 'theme',
    options: [],
  }),
  liveWpm: create<LiveWpm>({
    command: 'live wpm',
    category: 'hide elements',
    description: <>Displays a live WPM speed during the test. Updates once every second.</>,
    options: HIDE_SHOW_OPTIONS,
  }),
  liveAccuracy: create<LiveAccuracy>({
    command: 'live accuracy',
    category: 'hide elements',
    description: <>Displays live accuracy during the test.</>,
    options: HIDE_SHOW_OPTIONS,
  }),
  timerProgress: create<TimerProgress>({
    command: 'timer/progress',
    category: 'hide elements',
    description: <>Displays a live timer for timed tests and progress for words/custom tests.</>,
    options: HIDE_SHOW_OPTIONS,
  }),
  keyTips: create<KeyTips>({
    command: 'key tips',
    category: 'hide elements',
    description: <>Shows keybind tips throughout the website.</>,
    options: HIDE_SHOW_OPTIONS,
  }),
  outOfFocusWarning: create<OutOfFocusWarning>({
    command: 'out of focus warning',
    category: 'hide elements',
    description: (
      <>
        Shows an out of focus reminder after 1 second of being &apos;out of focus&apos; (not being
        able to type).
      </>
    ),
    options: HIDE_SHOW_OPTIONS,
  }),
  capsLockWarning: create<CapsLockWarning>({
    command: 'caps lock warning',
    category: 'hide elements',
    description: <>Displays a warning when caps lock is on.</>,
    options: HIDE_SHOW_OPTIONS,
  }),
};

export const defaultSettings: Settings = {
  mode: 'time',
  time: 60,
  words: 50,
  quickRestart: 'tab',
  language: 'english',
  quickEnd: true,
  indicateTypos: 'replace',
  hideExtraLetters: false,
  smoothCaret: true,
  caretStyle: 'default',
  timerProgressStyle: 'both',
  statsColor: 'main',
  statsOpacity: 0.5,
  smoothLineScroll: true,
  showDecimalPlaces: false,
  fontSize: 1.5,
  fontFamily: '--font-lexend-deca',
  pageWidth: '1250px',
  flipTestColors: false,
  colorfulMode: true,
  randomizeTheme: false,
  themeType: 'preset',
  theme: 'serika dark',
  customThemes: [],
  customThemeId: '',
  liveWpm: true,
  liveAccuracy: true,
  timerProgress: true,
  keyTips: true,
  outOfFocusWarning: true,
  capsLockWarning: true,
};
