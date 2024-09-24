import { useSettings } from '@/context/settingsContext';
import { useTypingTest } from '@/context/typingTestContext';
import { getRandomWords, parseWords } from '@/utils/typingTest';
import { useCallback } from 'react';

export function useWords() {
  const { mode, freedomMode, strictSpace, stopOnError, quickEnd, lazyMode } = useSettings();
  const { language, setValues } = useTypingTest();

  const add = useCallback(
    (count: number) => {
      if (language) {
        setValues(({ words }) => {
          const lastWord = words.at(-1)?.original;
          const randomWords = getRandomWords(count, language, lastWord);
          const newWords = parseWords(
            lazyMode && !language.noLazyMode
              ? // biome-ignore lint/suspicious/noMisleadingCharacterClass: required to remove diacritic marks
                randomWords.map((word) => word.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
              : randomWords,
          );
          words.push(...newWords);
        });
      }
    },
    [language, lazyMode, setValues],
  );

  const update = useCallback(
    (input: string) => {
      // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: todo
      setValues((draft) => {
        const { words, stats, wordIndex } = draft;
        const word = words[wordIndex];

        // Trim the input and remove leading/trailing spaces based on conditions
        let trimmedInput = input.replace(/^\s/, '');
        if ((stopOnError !== 'word' || word.isCorrect) && (!strictSpace || input.length > 2))
          trimmedInput = trimmedInput.replace(/\s$/, '');

        const inputLetters = trimmedInput.split('');
        const { letters } = word;

        // Process each input letter
        // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: todo
        inputLetters.forEach((inputLetter, index) => {
          const letter = letters[index];
          if (!letter) {
            draft.lastCharacter = inputLetter;

            // If the current letter does not exist, create a new extra letter, but only if
            // stopOnError is not 'letter'
            if (stopOnError !== 'letter')
              letters.push({ original: inputLetter, typed: inputLetter, status: 'extra' });

            stats.characters++;
            stats.errors++;
          } else if (letter.typed !== inputLetter) {
            draft.lastCharacter = inputLetter;
            stats.characters++;

            if (stopOnError !== 'letter' || letter.original === inputLetter)
              letter.typed = inputLetter;

            if (letter.original === inputLetter) letter.status = 'correct';
            else {
              if (stopOnError !== 'letter') letter.status = 'incorrect';
              stats.errors++;
            }
          }
        });

        for (let i = inputLetters.length; i < letters.length; i++) {
          const letter = letters[i];
          if (letter.status === 'extra') {
            // Remove any extra letters
            letters.splice(i);
            break;
          }
          if (letter.typed) {
            // Reset the status of any letters that were deleted
            letter.typed = undefined;
            letter.status = undefined;
          }
        }

        // Construct the typed word by joining the typed letters
        word.typed = letters.reduce(
          (string, { typed, status }) =>
            typed && (stopOnError !== 'letter' || status === 'correct') ? string + typed : string,
          '',
        );

        word.isCorrect = word.original === word.typed;
        draft.inputValue = stopOnError === 'word' ? input : input.replace(/\S+/, word.typed);

        // Check if quick end is enabled and the last word is fully typed
        if (
          mode === 'words' &&
          quickEnd &&
          wordIndex === words.length - 1 &&
          word.typed.length === word.original.length
        )
          draft.wordIndex++;

        // Handle special cases for input strings

        // Case 1: Input is empty - The input string always have a leading space, if it is empty,
        // it means the whole word was deleted and the previous word should be selected
        if (!input) {
          draft.inputValue = ' ';
          const previousWord = words[wordIndex - 1];

          if (wordIndex > 0 && (!previousWord.isCorrect || freedomMode)) {
            // Reset the status of any letters that were not typed
            for (const letter of previousWord.letters) if (!letter.typed) letter.status = undefined;
            draft.inputValue = ` ${previousWord.typed ?? ''}`;
            draft.wordIndex--;
          }
          // Case 2: Input has more than one character and ends with a space - If the input string
          // has a trailing space, the next word will be selected
        } else if (input.length > 1 && input.endsWith(' ')) {
          draft.lastCharacter = ' ';
          if (stopOnError && !word.isCorrect) {
            if (stopOnError === 'letter') {
              // If the word has been partially typed, remove the last character from the
              // input value, otherwise reset it
              draft.inputValue = word.typed ? draft.inputValue.trimEnd() : ' ';
              stats.characters++;
              stats.errors++;
            }
          } else {
            if (!strictSpace) draft.inputValue = ' ';
            // If the input string has more than two characters (leading and trailing space,
            // and 1 or more letter between the spaces)
            if (input.length > 2) {
              const nextWord = words[wordIndex + 1]; // Set the status of any missed letters in the current word
              for (const letter of letters) if (!letter.typed) letter.status = 'missed';
              // Update errors and characters stats accordingly
              if (letters.at(-1)?.status === 'missed') stats.errors++;
              if (nextWord) stats.characters++;
              draft.wordIndex++;
              draft.inputValue = ' ';
            }
          }
        }
      });
    },
    [freedomMode, mode, quickEnd, setValues, strictSpace, stopOnError],
  );

  return { add, update };
}
