export interface Language {
  name: string;
  rightToLeft?: boolean;
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

export function calculateCharStats(words: Word[]) {
  return words.reduce(
    (characters, { isCorrect, letters }) => {
      for (const { status } of letters)
        if (status === 'correct') {
          if (isCorrect) characters.correct++;
        } else if (status) characters[status]++;
      return characters;
    },
    { correct: 0, incorrect: 0, extra: 0, missed: 0 },
  );
}
