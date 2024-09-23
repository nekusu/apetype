import { Key } from '@/components/core/Key';
import { camel, get, set } from 'radashi';
import type { ReactNode } from 'react';
import {
  type GenericSchema,
  array,
  boolean,
  check,
  forward,
  getDotPath,
  integer,
  literal,
  minValue,
  nonEmpty,
  null_,
  number,
  picklist,
  pipe,
  safeParse,
  strictObject,
  string,
  trim,
  union,
  uuid,
} from 'valibot';
import type { CustomTheme } from './theme';

export type Sound = 'beep' | 'click' | 'hitmarker' | 'nk-creams' | 'osu' | 'pop' | 'typewriter';
export type Time = 15 | 30 | 60 | 120;
export type Words = 10 | 25 | 50 | 100;
export interface Settings {
  mode: 'time' | 'words';
  time: number;
  words: number;
  quickRestart: false | 'tab' | 'esc';
  blindMode: boolean;
  language: string;
  freedomMode: boolean;
  strictSpace: boolean;
  stopOnError: false | 'letter' | 'word';
  quickEnd: boolean;
  indicateTypos: false | 'below' | 'replace';
  hideExtraLetters: boolean;
  lazyMode: boolean;
  soundVolume: 0.1 | 0.5 | 1;
  soundOnClick: false | Sound;
  soundOnError: boolean;
  smoothCaret: boolean;
  caretStyle: false | 'default' | 'block' | 'outline' | 'underline';
  timerProgressStyle: 'text' | 'bar' | 'both';
  statsColor: 'sub' | 'text' | 'main';
  statsOpacity: 0.25 | 0.5 | 0.75 | 1;
  smoothLineScroll: boolean;
  showDecimalPlaces: boolean;
  fontSize: 1 | 1.25 | 1.5 | 2 | 3 | 4;
  fontFamily: string;
  pageWidth: '1000px' | '1250px' | '1500px' | '2000px' | '100%';
  keymap: false | 'static' | 'react' | 'next';
  keymapLayout: string;
  keymapStyle: 'staggered' | 'matrix' | 'split' | 'split matrix';
  keymapLegendStyle: 'dynamic' | 'lowercase' | 'uppercase' | 'blank';
  keymapShowTopRow: boolean | 'layout dependent';
  flipTestColors: boolean;
  colorfulMode: boolean;
  randomizeTheme: boolean | 'light' | 'dark';
  themeType: 'preset' | 'custom';
  theme: string;
  customThemes: CustomTheme[];
  customTheme: string | null;
  liveWpm: boolean;
  liveAccuracy: boolean;
  timerProgress: boolean;
  keyTips: boolean;
  outOfFocusWarning: boolean;
  capsLockWarning: boolean;
  persistentCache: boolean;
}

type Option<T extends keyof Settings> = { alt?: string; value: Settings[T] };
export interface SettingParams<T extends keyof Settings> {
  command: string;
  category?: (typeof categories)[number];
  description?: ReactNode;
  options?: (Option<T> | Settings[T])[];
  custom?: boolean;
  hidden?: boolean;
}

const OFF_OPTION = { alt: 'off', value: false } as const;
const ON_OPTION = { alt: 'on', value: true } as const;
const OFF_ON_OPTIONS = [OFF_OPTION, ON_OPTION];
const HIDE_OPTION = { alt: 'hide', value: false } as const;
const SHOW_OPTION = { alt: 'show', value: true } as const;
const HIDE_SHOW_OPTIONS = [HIDE_OPTION, SHOW_OPTION];

function create<T extends keyof Settings>({ options, ...params }: SettingParams<T>) {
  return {
    id: camel(params.command) as keyof Settings,
    options:
      (options?.map((value) => (typeof value !== 'object' ? { value } : value)) as Option<T>[]) ??
      [],
    ...params,
  } as const;
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
const warningMessage = <span className='text-error'>You can't undo this action!</span>;

export const settingsReference = {
  mode: create<'mode'>({
    command: 'mode',
    options: ['time', 'words'],
  }),
  time: create<'time'>({
    command: 'time',
    options: [15, 30, 60, 120],
    custom: true,
  }),
  words: create<'words'>({
    command: 'words',
    options: [10, 25, 50, 100],
    custom: true,
  }),
  quickRestart: create<'quickRestart'>({
    command: 'quick restart',
    category: 'behavior',
    description: (
      <>
        Press <Key>tab</Key> or <Key>esc</Key> to quickly restart the test, or to quickly jump to
        the test page. Both options disable tab navigation on most parts of the website. Using the
        "esc" option will move opening the command line to the <Key>tab</Key> key.
      </>
    ),
    options: [OFF_OPTION, 'tab', 'esc'],
  }),
  blindMode: create<'blindMode'>({
    command: 'blind mode',
    category: 'behavior',
    description: (
      <>
        No errors or incorrect words are highlighted. Helps you to focus on raw speed. If enabled,
        quick end is recommended.
      </>
    ),
    options: OFF_ON_OPTIONS,
  }),
  language: create<'language'>({
    command: 'language',
    category: 'behavior',
    description: <>Change in which language you want to type.</>,
  }),
  freedomMode: create<'freedomMode'>({
    command: 'freedom mode',
    category: 'input',
    description: <>Allows you to delete any word, even if it was typed correctly.</>,
    options: OFF_ON_OPTIONS,
  }),
  strictSpace: create<'strictSpace'>({
    command: 'strict space',
    category: 'input',
    description: (
      <>
        Pressing space at the beginning of a word will insert a space character when this mode is
        enabled.
      </>
    ),
    options: OFF_ON_OPTIONS,
  }),
  stopOnError: create<'stopOnError'>({
    command: 'stop on error',
    category: 'input',
    description: (
      <>
        Letter mode will stop input when pressing any incorrect letters. Word mode will not allow
        you to continue to the next word until you correct all mistakes.
      </>
    ),
    options: [OFF_OPTION, 'letter', 'word'],
  }),
  quickEnd: create<'quickEnd'>({
    command: 'quick end',
    category: 'input',
    description: (
      <>
        This only applies to the words mode - when enabled, the test will end as soon as the last
        word has been typed, even if it's incorrect. When disabled, you need to manually confirm the
        last incorrect entry with a space.
      </>
    ),
    options: OFF_ON_OPTIONS,
  }),
  indicateTypos: create<'indicateTypos'>({
    command: 'indicate typos',
    category: 'input',
    description: (
      <>
        Shows typos that you've made. Below shows what you typed below the letters and replace will
        replace the letters with the ones you typed.
      </>
    ),
    options: [OFF_OPTION, 'below', 'replace'],
  }),
  hideExtraLetters: create<'hideExtraLetters'>({
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
  lazyMode: create<'lazyMode'>({
    command: 'lazy mode',
    category: 'input',
    description: (
      <>Replaces accents / diacritics / special characters with their normal letter equivalents.</>
    ),
    options: OFF_ON_OPTIONS,
  }),
  soundVolume: create<'soundVolume'>({
    command: 'sound volume',
    category: 'sound',
    description: <>Change the volume of the sound effects.</>,
    options: [
      { alt: 'quiet', value: 0.1 },
      { alt: 'medium', value: 0.5 },
      { alt: 'loud', value: 1 },
    ],
  }),
  soundOnClick: create<'soundOnClick'>({
    command: 'sound on click',
    category: 'sound',
    description: <>Plays a short sound when you press a key.</>,
    options: [
      OFF_OPTION,
      'beep',
      'click',
      'hitmarker',
      { alt: 'nk creams', value: 'nk-creams' },
      'osu',
      'pop',
      'typewriter',
    ],
  }),
  soundOnError: create<'soundOnError'>({
    command: 'sound on error',
    category: 'sound',
    description: <>Plays a short sound if you press an incorrect key or press space too early.</>,
    options: OFF_ON_OPTIONS,
  }),
  smoothCaret: create<'smoothCaret'>({
    command: 'smooth caret',
    category: 'caret',
    description: <>When enabled, the caret will move smoothly between letters and words.</>,
    options: OFF_ON_OPTIONS,
  }),
  caretStyle: create<'caretStyle'>({
    command: 'caret style',
    category: 'caret',
    description: <>Change the style of the caret during the test.</>,
    options: [
      OFF_OPTION,
      { alt: '|', value: 'default' },
      { alt: '▮', value: 'block' },
      { alt: '▯', value: 'outline' },
      { alt: '_', value: 'underline' },
    ],
  }),
  timerProgressStyle: create<'timerProgressStyle'>({
    command: 'timer/progress style',
    category: 'appearance',
    description: <>Change the style of the timer/progress-bar during a test.</>,
    options: ['text', 'bar', 'both'],
  }),
  statsColor: create<'statsColor'>({
    command: 'stats color',
    category: 'appearance',
    description: <>Change the color of the timer/progress-bar, live wpm, and accuracy stats.</>,
    options: ['sub', 'text', 'main'],
  }),
  statsOpacity: create<'statsOpacity'>({
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
  smoothLineScroll: create<'smoothLineScroll'>({
    command: 'smooth line scroll',
    category: 'appearance',
    description: <>When enabled, the line transition will be animated.</>,
    options: OFF_ON_OPTIONS,
  }),
  showDecimalPlaces: create<'showDecimalPlaces'>({
    command: 'show decimal places',
    category: 'appearance',
    description: <>Always shows decimal places for values on the result page.</>,
    options: OFF_ON_OPTIONS,
  }),
  fontSize: create<'fontSize'>({
    command: 'font size',
    category: 'appearance',
    description: <>Change the font size of the test words.</>,
    options: [1, 1.25, 1.5, 2, 3, 4],
  }),
  fontFamily: create<'fontFamily'>({
    command: 'font family',
    category: 'appearance',
    options: [
      'Fira Code',
      'Inconsolata',
      'JetBrains Mono',
      'Lato',
      'Lexend Deca',
      'Montserrat',
      'Nunito',
      'Oxygen',
      'Roboto',
      'Roboto Mono',
      'Source Code Pro',
      'Ubuntu',
      'Ubuntu Mono',
    ],
    custom: true,
  }),
  pageWidth: create<'pageWidth'>({
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
  keymap: create<'keymap'>({
    command: 'keymap',
    category: 'appearance',
    description: <>Controls which layout is displayed on the keymap.</>,
    options: [OFF_OPTION, 'static', 'react', 'next'],
  }),
  keymapLayout: create<'keymapLayout'>({
    command: 'keymap layout',
    category: 'appearance',
  }),
  keymapStyle: create<'keymapStyle'>({
    command: 'keymap style',
    category: 'appearance',
    options: ['staggered', 'matrix', 'split', 'split matrix'],
  }),
  keymapLegendStyle: create<'keymapLegendStyle'>({
    command: 'keymap legend style',
    category: 'appearance',
    options: ['dynamic', 'lowercase', 'uppercase', 'blank'],
  }),
  keymapShowTopRow: create<'keymapShowTopRow'>({
    command: 'keymap show top row',
    category: 'appearance',
    options: [{ alt: 'always', value: true }, 'layout dependent', { alt: 'never', value: false }],
  }),
  flipTestColors: create<'flipTestColors'>({
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
  colorfulMode: create<'colorfulMode'>({
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
  randomizeTheme: create<'randomizeTheme'>({
    command: 'randomize theme',
    category: 'theme',
    description: (
      <>
        After completing a test, the theme will be set to a random one. If set to 'light' or 'dark',
        only presets with light or dark background colors will be randomized, respectively.
      </>
    ),
    options: [...OFF_ON_OPTIONS, 'light', 'dark'],
  }),
  theme: create<'theme'>({
    command: 'theme',
    category: 'theme',
  }),
  customTheme: create<'customTheme'>({
    command: 'custom theme',
    category: 'theme',
    hidden: true,
  }),
  liveWpm: create<'liveWpm'>({
    command: 'live wpm',
    category: 'hide elements',
    description: <>Displays a live WPM speed during the test. Updates once every second.</>,
    options: HIDE_SHOW_OPTIONS,
  }),
  liveAccuracy: create<'liveAccuracy'>({
    command: 'live accuracy',
    category: 'hide elements',
    description: <>Displays live accuracy during the test.</>,
    options: HIDE_SHOW_OPTIONS,
  }),
  timerProgress: create<'timerProgress'>({
    command: 'timer/progress',
    category: 'hide elements',
    description: <>Displays a live timer for timed tests and progress for words/custom tests.</>,
    options: HIDE_SHOW_OPTIONS,
  }),
  keyTips: create<'keyTips'>({
    command: 'key tips',
    category: 'hide elements',
    description: <>Shows keybind tips throughout the website.</>,
    options: HIDE_SHOW_OPTIONS,
  }),
  outOfFocusWarning: create<'outOfFocusWarning'>({
    command: 'out of focus warning',
    category: 'hide elements',
    description: (
      <>
        Shows an out of focus reminder after 1 second of being 'out of focus' (not being able to
        type).
      </>
    ),
    options: HIDE_SHOW_OPTIONS,
  }),
  capsLockWarning: create<'capsLockWarning'>({
    command: 'caps lock warning',
    category: 'hide elements',
    description: <>Displays a warning when caps lock is on.</>,
    options: HIDE_SHOW_OPTIONS,
  }),
  importExportSettings: create({
    command: 'import/export settings',
    category: 'danger zone',
    description: <>Import or export settings as JSON.</>,
  }),
  resetSettings: create({
    command: 'reset settings',
    category: 'danger zone',
    description: (
      <>
        Resets settings to their default values.
        <br />
        {warningMessage}
      </>
    ),
  }),
  persistentCache: create<'persistentCache'>({
    command: 'persistent cache',
    category: 'danger zone',
    description: (
      <>
        When enabled, certain data will be saved to the browser's local storage. This avoids
        repeated requests to the server, improving load times and reducing bandwidth usage. Large
        cache may slow down site's initial load.
      </>
    ),
    options: OFF_ON_OPTIONS,
  }),
  authenticationMethods: create({
    command: 'authentication methods',
    category: 'danger zone',
    description: <>Link or unlink authentication methods.</>,
  }),
  passwordAuthentication: create({
    command: 'password authentication',
    category: 'danger zone',
  }),
  resetPersonalBests: create({
    command: 'reset personal bests',
    category: 'danger zone',
    description: (
      <>
        Resets all your personal bests (but doesn't delete any tests from your history).
        <br />
        {warningMessage}
      </>
    ),
  }),
  resetAccount: create({
    command: 'reset account',
    category: 'danger zone',
    description: (
      <>
        Resets your typing stats, personal bests and test history. Other profile details will not be
        affected.
        <br />
        {warningMessage}
      </>
    ),
  }),
  deleteAccount: create({
    command: 'delete account',
    category: 'danger zone',
    description: (
      <>
        Deletes your account and all your data.
        <br />
        {warningMessage}
      </>
    ),
  }),
};
export type SettingsReference = typeof settingsReference;

export const defaultSettings: Settings = {
  mode: 'time',
  time: 60,
  words: 50,
  quickRestart: 'tab',
  blindMode: false,
  language: 'english',
  freedomMode: false,
  strictSpace: false,
  stopOnError: false,
  quickEnd: true,
  indicateTypos: 'replace',
  hideExtraLetters: false,
  lazyMode: false,
  soundVolume: 0.5,
  soundOnClick: false,
  soundOnError: true,
  smoothCaret: true,
  caretStyle: 'default',
  timerProgressStyle: 'both',
  statsColor: 'main',
  statsOpacity: 0.5,
  smoothLineScroll: true,
  showDecimalPlaces: false,
  fontSize: 1.5,
  fontFamily: 'Lexend Deca',
  pageWidth: '1250px',
  keymap: false,
  keymapLayout: 'qwerty',
  keymapStyle: 'staggered',
  keymapLegendStyle: 'dynamic',
  keymapShowTopRow: 'layout dependent',
  flipTestColors: false,
  colorfulMode: true,
  randomizeTheme: false,
  themeType: 'preset',
  theme: 'aurora',
  customThemes: [],
  customTheme: null,
  liveWpm: true,
  liveAccuracy: true,
  timerProgress: true,
  keyTips: true,
  outOfFocusWarning: true,
  capsLockWarning: true,
  persistentCache: true,
};

const positiveInteger = () => pipe(number(), integer(), minValue(0));
const nonEmptyString = () => pipe(string(), trim(), nonEmpty());
const SettingsSchema = pipe(
  strictObject({
    mode: picklist(['time', 'words']),
    time: positiveInteger(),
    words: positiveInteger(),
    quickRestart: union([literal(false), picklist(['tab', 'esc'])]),
    blindMode: boolean(),
    language: nonEmptyString(),
    freedomMode: boolean(),
    strictSpace: boolean(),
    stopOnError: union([literal(false), picklist(['letter', 'word'])]),
    quickEnd: boolean(),
    indicateTypos: union([literal(false), picklist(['below', 'replace'])]),
    hideExtraLetters: boolean(),
    lazyMode: boolean(),
    soundVolume: union([literal(0.1), literal(0.5), literal(1)]),
    soundOnClick: union([
      literal(false),
      picklist(['beep', 'click', 'hitmarker', 'nk-creams', 'osu', 'pop', 'typewriter']),
    ]),
    soundOnError: boolean(),
    smoothCaret: boolean(),
    caretStyle: union([literal(false), picklist(['default', 'block', 'outline', 'underline'])]),
    timerProgressStyle: picklist(['text', 'bar', 'both']),
    statsColor: picklist(['sub', 'text', 'main']),
    statsOpacity: union([literal(0.25), literal(0.5), literal(0.75), literal(1)]),
    smoothLineScroll: boolean(),
    showDecimalPlaces: boolean(),
    fontSize: union([literal(1), literal(1.25), literal(1.5), literal(2), literal(3), literal(4)]),
    fontFamily: nonEmptyString(),
    pageWidth: picklist(['1000px', '1250px', '1500px', '2000px', '100%']),
    keymap: union([literal(false), picklist(['static', 'react', 'next'])]),
    keymapLayout: nonEmptyString(),
    keymapStyle: picklist(['staggered', 'matrix', 'split', 'split matrix']),
    keymapLegendStyle: picklist(['dynamic', 'lowercase', 'uppercase', 'blank']),
    keymapShowTopRow: union([boolean(), literal('layout dependent')]),
    flipTestColors: boolean(),
    colorfulMode: boolean(),
    randomizeTheme: union([boolean(), picklist(['light', 'dark'])]),
    themeType: picklist(['preset', 'custom']),
    theme: nonEmptyString(),
    customThemes: array(
      strictObject({
        id: pipe(string(), uuid()),
        name: nonEmptyString(),
        colors: strictObject({
          bg: nonEmptyString(),
          main: nonEmptyString(),
          caret: nonEmptyString(),
          sub: nonEmptyString(),
          subAlt: nonEmptyString(),
          text: nonEmptyString(),
          error: nonEmptyString(),
          errorExtra: nonEmptyString(),
          colorfulError: nonEmptyString(),
          colorfulErrorExtra: nonEmptyString(),
        }),
      }),
    ),
    customTheme: union([pipe(string(), uuid()), null_()]),
    liveWpm: boolean(),
    liveAccuracy: boolean(),
    timerProgress: boolean(),
    keyTips: boolean(),
    outOfFocusWarning: boolean(),
    capsLockWarning: boolean(),
    persistentCache: boolean(),
  }),
  forward(
    check(
      ({ customThemes, customTheme }) =>
        !customTheme || customThemes.some(({ id }) => id === customTheme),
    ),
    ['customTheme'],
  ),
) satisfies GenericSchema<Settings>;

export interface ValidationIssue {
  path: string | null;
  value: unknown;
  defaultValue?: unknown;
}

export function validateSettings(
  settings: Settings,
  customProperties: Partial<Record<keyof Settings, GenericSchema>> = {},
) {
  const [missing, invalid, unknown]: ValidationIssue[][] = [[], [], []];
  const MergedSettingsSchema = strictObject({
    ...SettingsSchema.entries,
    ...strictObject(customProperties).entries,
  });
  const { success, issues, output } = safeParse(MergedSettingsSchema, settings);
  let newSettings = output as Settings;

  if (success) return [newSettings, { missing, invalid, unknown }] as const;

  for (const vIssue of issues) {
    const { path: issuePath, expected } = vIssue;
    const path = getDotPath(vIssue);
    if (!(issuePath && path)) continue;
    const { value } = issuePath.at(-1) ?? {};
    const issue: ValidationIssue = { path, value };
    if (expected === 'never') unknown.push(issue);
    else {
      if (value !== undefined) invalid.push(issue);
      else missing.push(issue);
      issue.defaultValue = get(defaultSettings, path, null);
      newSettings = set(newSettings, path, issue.defaultValue);
    }
  }

  return [newSettings, { missing, invalid, unknown }] as const;
}
