'use client';

import { ZxcvbnResult } from '@zxcvbn-ts/core';
import { Text, Tooltip } from 'components/core';
import { memo, useEffect, useState } from 'react';
import { RiQuestionLine } from 'react-icons/ri';
import { twMerge } from 'tailwind-merge';

export interface PasswordStrengthProps {
  minPasswordLength?: number;
  onResult?: (result: ZxcvbnResult) => void;
  password?: string;
  userInputs?: (string | number)[];
}

const STRENGTH = ['Weak', 'Average', 'Good', 'Strong'];
const PAGE_RELATED_WORDS = ['ape', 'apetype'];

function PasswordStrength({
  minPasswordLength = 8,
  onResult,
  password = '',
  userInputs,
}: PasswordStrengthProps) {
  const [result, setResult] = useState<ZxcvbnResult | null>(null);

  useEffect(() => {
    void (async () => {
      const { zxcvbnAsync, zxcvbnOptions } = await import('@zxcvbn-ts/core');
      const zxcvbnCommonPackage = await import('@zxcvbn-ts/language-common');
      const zxcvbnEnPackage = await import('@zxcvbn-ts/language-en');
      zxcvbnOptions.setOptions({
        dictionary: {
          ...zxcvbnCommonPackage.dictionary,
          ...zxcvbnEnPackage.dictionary,
        },
        graphs: zxcvbnCommonPackage.adjacencyGraphs,
        useLevenshteinDistance: true,
        translations: zxcvbnEnPackage.translations,
      });
      const result = await zxcvbnAsync(password, [...(userInputs ?? []), ...PAGE_RELATED_WORDS]);
      setResult(result);
      onResult?.(result);
    })();
  }, [onResult, password, userInputs]);

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex gap-1.5'>
        {STRENGTH.map((_, index) => (
          <div
            key={index}
            className={twMerge(
              'h-1 w-full rounded-lg transition-colors',
              result &&
                (result.score > index || index === 0) &&
                password.length >= minPasswordLength
                ? ['bg-error', result.score === 2 && 'bg-text', result.score >= 3 && 'bg-main']
                : 'bg-sub',
            )}
          />
        ))}
      </div>
      <div className='flex items-center justify-between'>
        <Text className='text-sm' dimmed={password.length < minPasswordLength}>
          {result && password.length >= minPasswordLength
            ? ['Weak', ...STRENGTH][result.score]
            : `Password must have at least ${minPasswordLength} characters`}
        </Text>
        {result && (result.feedback.warning || result.feedback.suggestions.length > 0) && (
          <Tooltip
            className='max-w-xs'
            label={
              <>
                <div className='flex flex-col gap-1 text-sm'>
                  {result.feedback.warning && (
                    <Text className='text-[length:inherit] text-error'>
                      {result.feedback.warning}
                    </Text>
                  )}
                  {result.feedback.suggestions.map((suggestion, i) => (
                    <Text key={i} className='text-[length:inherit]' dimmed>
                      {suggestion}
                    </Text>
                  ))}
                </div>
              </>
            }
          >
            <div className='cursor-help text-text transition-colors'>
              <RiQuestionLine />
            </div>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

export default memo(PasswordStrength);
