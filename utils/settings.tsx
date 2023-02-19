import { Key } from 'components/core';
import { ReactNode } from 'react';

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
}

export interface SettingParams<T> {
  command: string;
  category?:
    | 'behavior'
    | 'input'
    | 'sound'
    | 'caret'
    | 'appearance'
    | 'theme'
    | 'hide elements'
    | 'danger zone';
  description?: ReactNode;
  options: { alt?: string; value: T }[];
  custom?: boolean;
}

export type SettingsKey = keyof Settings;
export type SettingsEntries = [SettingsKey, SettingParams<SettingsKey>][];
export type SettingsKeys = SettingsKey[];
export type SettingsValues = SettingParams<SettingsKey>[];

const BOOLEAN_OPTIONS = [
  { alt: 'off', value: false },
  { alt: 'on', value: true },
];

function create<T>(params: SettingParams<T>) {
  return params;
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
];

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
    options: BOOLEAN_OPTIONS,
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
    options: BOOLEAN_OPTIONS,
  }),
  smoothCaret: create<SmoothCaret>({
    command: 'smooth caret',
    category: 'caret',
    description: <>When enabled, the caret will move smoothly between letters and words.</>,
    options: BOOLEAN_OPTIONS,
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
    options: BOOLEAN_OPTIONS,
  }),
  showDecimalPlaces: create<ShowDecimalPlaces>({
    command: 'show decimal places',
    category: 'appearance',
    description: <>Always shows decimal places for values on the result page.</>,
    options: BOOLEAN_OPTIONS,
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
    options: BOOLEAN_OPTIONS,
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
    options: BOOLEAN_OPTIONS,
  }),
};

export const settingsEntries = Object.entries(settingsList) as SettingsEntries;
export const settingsKeys = Object.keys(settingsList) as SettingsKeys;
export const settingsValues = Object.values(settingsList) as SettingsValues;

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
};
