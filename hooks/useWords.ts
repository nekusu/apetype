import { useSettings } from 'context/settingsContext';
import { useTypingTest } from 'context/typingTestContext';
import { useCallback, useMemo } from 'react';
import { getRandomWords, parseWords } from 'utils/typingTest';
import { useLanguage } from './useLanguage';

export function useWords() {
  const { mode, language: languageName, quickEnd } = useSettings();
  const { setValues } = useTypingTest();
  const { language } = useLanguage(languageName);

  const add = useCallback(
    (count: number) => {
      if (language) {
        setValues(({ words }) => {
          const lastWord = words.at(-1)?.original;
          const newWords = parseWords(getRandomWords(count, language, lastWord));
          words.push(...newWords);
        });
      }
    },
    [language, setValues]
  );

  const update = useCallback(
    (input: string) => {
      setValues((draft) => {
        const { words, currentStats, wordIndex } = draft;
        const trimmedInput = input.trim();
        const inputLetters = trimmedInput.split('');
        const word = words[wordIndex];
        const { letters } = word;

        inputLetters.forEach((inputLetter, index) => {
          const letter = letters[index];
          if (!letter) {
            // If the current letter does not exist, create a new extra letter
            letters.push({ original: inputLetter, typed: inputLetter, status: 'extra' });
            currentStats.characters++;
            currentStats.errors++;
          } else if (letter.typed !== inputLetter) {
            // If the current letter object has a different typed value, update it
            letter.typed = inputLetter;
            currentStats.characters++;

            if (letter.original === inputLetter) {
              letter.status = 'correct';
            } else {
              letter.status = 'incorrect';
              currentStats.errors++;
            }
          }
        });
        letters.slice(inputLetters.length).forEach((letter, index) => {
          if (letter.status === 'extra') {
            // Remove any extra letters
            letters.splice(inputLetters.length + index, 1);
          } else if (letter.typed) {
            // Reset the status of any letters that were deleted
            letter.typed = undefined;
            letter.status = undefined;
          }
        });
        word.typed = trimmedInput;
        word.isCorrect = word.original === trimmedInput;
        draft.inputValue = input;

        if (
          mode === 'words' &&
          quickEnd &&
          wordIndex === words.length - 1 &&
          word.typed.length === word.original.length
        ) {
          draft.wordIndex++;
        }

        // The input string always have a leading space, if it is empty, it means the whole word
        // was deleted and the previous word should be selected, if it has a trailing space,
        // the next word will be selected
        if (!input) {
          draft.inputValue = ' ';

          if (wordIndex > 0) {
            // Get the previous word and reset the status of any letters that were not typed
            const previousWord = words[wordIndex - 1];

            previousWord.letters.forEach((letter) => {
              if (!letter.typed) {
                letter.status = undefined;
              }
            });
            // Set the new input value to the typed value of the previous word and
            // decrement the word index
            draft.inputValue = previousWord.typed ?? '';
            draft.wordIndex--;
          }
        } else if (input.length > 1 && input.endsWith(' ')) {
          // First check if the input string has more than one character and ends with a space,
          // this resets the input string in case there are two spaces between words
          draft.inputValue = ' ';

          if (input.length > 2) {
            // If the input string has more than two characters (leading and trailing space, 1+ letters),
            // set the status of any missed letters in the current word and increment the word index
            const nextWord = words[wordIndex + 1];

            letters.forEach((letter) => {
              if (!letter.typed) letter.status = 'missed';
            });

            if (letters.at(-1)?.status === 'missed') currentStats.errors++;
            if (nextWord) currentStats.characters++;
            draft.wordIndex++;
          }
        }
      });
    },
    [mode, quickEnd, setValues]
  );

  return useMemo(() => ({ add, update }), [add, update]);
}
