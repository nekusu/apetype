export interface Language {
  name: string;
  noLazyMode?: boolean;
  words: string[];
}

export interface KeymapLayout {
  keymapShowTopRow: boolean;
  type: 'ansi' | 'iso';
  keys: {
    row1: string[];
    row2: string[];
    row3: string[];
    row4: string[];
    row5: string[];
  };
}

export interface Letter {
  original?: string;
  typed?: string;
  status?: 'correct' | 'incorrect' | 'extra' | 'missed';
}

export interface Word {
  original: string;
  typed?: string;
  letters: Letter[];
  isCorrect: boolean;
}

export interface TypingTestValues {
  words: Word[];
  wordIndex: number;
  inputValue: string;
  lastCharacter: string;
  currentStats: {
    raw: number;
    wpm: number;
    characters: number;
    errors: number;
  };
  stats: {
    raw: number[];
    wpm: number[];
    characters: number[];
    errors: number[];
  };
  timer: number;
  startTime: number;
  elapsedTime: number;
  isTestRunning: boolean;
}

export const initialValues: TypingTestValues = {
  words: [],
  wordIndex: 0,
  inputValue: ' ',
  lastCharacter: ' ',
  currentStats: {
    raw: 0,
    wpm: 0,
    characters: 0,
    errors: 0,
  },
  stats: {
    raw: [],
    wpm: [],
    characters: [],
    errors: [],
  },
  timer: 0,
  startTime: 0,
  elapsedTime: 0,
  isTestRunning: false,
};

export function getRandomWords(count: number, language: Language, lastWord?: string) {
  const words: string[] = [];
  while (words.length < count) {
    const randomIndex = Math.floor(Math.random() * language.words.length);
    const word = language.words[randomIndex];
    if (word !== (words.at(-1) ?? lastWord)) {
      words.push(word);
    }
  }
  return words;
}

export function parseWords(words: string[]): Word[] {
  return words.map((word) => ({
    original: word,
    isCorrect: false,
    letters: word.split('').map((letter) => ({ original: letter })),
  }));
}

export function accuracy(characters: number, errors: number) {
  return Math.max((1 - errors / characters) * 100, 0);
}

export function mean(numbers: number[]) {
  return numbers.reduce((a, b) => a + b, 0) / numbers.length;
}

export function standardDeviation(numbers: number[]) {
  const avg = mean(numbers);
  return Math.sqrt(numbers.reduce((a, b) => a + (b - avg) ** 2, 0) / numbers.length);
}

export function coefficientOfVariation(numbers: number[]) {
  return standardDeviation(numbers) / mean(numbers);
}

export function consistency(numbers: number[]) {
  const cov = coefficientOfVariation(numbers);
  return 100 * (1 - Math.tanh(cov + cov ** 3 / 3 + cov ** 5 / 5));
}
