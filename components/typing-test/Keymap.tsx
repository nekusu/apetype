'use client';

import { useDidUpdate, useWindowEvent } from '@mantine/hooks';
import { Tooltip } from 'components/core';
import { useGlobal } from 'context/globalContext';
import { useSettings } from 'context/settingsContext';
import { useTypingTest } from 'context/typingTestContext';
import {
  ComponentPropsWithoutRef,
  ElementRef,
  Fragment,
  forwardRef,
  memo,
  useRef,
  useState,
} from 'react';
import { twJoin, twMerge } from 'tailwind-merge';
import { replaceSpaces } from 'utils/misc';
import { Settings } from 'utils/settings';

interface KeyProps extends ComponentPropsWithoutRef<'div'> {
  bump?: boolean;
  keymap?: Settings['keymap'];
  order?: number;
  status: boolean | 'error';
}

const Key = memo(
  forwardRef<ElementRef<'div'>, KeyProps>(function Key(
    { bump, children, className, keymap, order, status, style, ...props },
    ref
  ) {
    const [state, setState] = useState<typeof status>(false);

    useDidUpdate(() => {
      if (keymap === 'react') {
        if (status) {
          setState(status);
          setTimeout(() => setState(false), 50);
        }
      }
      setState(status);
    }, [status]);

    return (
      <div
        ref={ref}
        className={twMerge([
          'relative flex h-8 w-8 items-center justify-center rounded-lg border border-sub text-sub transition',
          keymap !== 'next' && 'duration-300',
          state && 'border-main bg-main text-bg duration-0',
          state && keymap === 'react' && 'scale-[.925]',
          state === 'error' && 'border-error bg-error',
          className,
        ])}
        style={{ order, ...style }}
        {...props}
      >
        {children}
        {bump && (
          <span
            className={twJoin(['absolute bottom-[0.2rem] h-px w-2', state ? 'bg-bg' : 'bg-sub'])}
          />
        )}
      </div>
    );
  })
);

export default function Keymap() {
  const { isUserTyping, keymapLayouts, commandLine } = useGlobal();
  const { keymap, keymapLayout, keymapStyle, keymapLegendStyle, keymapShowTopRow } = useSettings();
  const { words, wordIndex, currentStats } = useTypingTest();
  const { characters, errors } = currentStats;
  const [pressed, setPressed] = useState<{ key?: string; error?: boolean } | null>(null);
  const [{ capsLock, shift }, setModifiers] = useState({ capsLock: false, shift: false });
  const layout = keymapLayouts[replaceSpaces(keymapLayout)];
  const isMatrix = keymapStyle.includes('matrix');
  const isSplit = keymapStyle.includes('split');
  const hideTopRow =
    (keymapShowTopRow === 'layout dependent' && !layout.keymapShowTopRow) || !keymapShowTopRow;
  const lastCharacterCount = useRef(0);
  const lastErrorCount = useRef(0);

  const handleCapsLockShift = (e: KeyboardEvent) => {
    setModifiers({ capsLock: e.getModifierState('CapsLock'), shift: e.getModifierState('Shift') });
  };
  const getStatus = (key: string) => {
    if (pressed?.key && key.includes(pressed.key)) return pressed.error ? 'error' : true;
    return false;
  };
  const getLegend = (rowIndex: number, keyIndex: number) => {
    const key = Object.values(layout.keys)[rowIndex][keyIndex];
    if (!key) return null;
    const isLetter = key.match(/\p{L}/gu);
    switch (keymapLegendStyle) {
      case 'lowercase':
        return key[0];
      case 'uppercase':
        return key[isLetter ? 1 : 0];
      case 'dynamic':
        if (isLetter) return key[(capsLock ? !shift : shift) ? 1 : 0];
        else return key[shift ? 1 : 0];
      default:
        return null;
    }
  };

  useDidUpdate(() => {
    if (!words[wordIndex]) return;
    const { letters } = words[wordIndex];
    setPressed(null);
    if (keymap === 'react') {
      if (characters > lastCharacterCount.current) {
        const pressedKey = letters.findLast(({ typed }) => typed)?.typed ?? ' ';
        setPressed({ key: pressedKey, error: errors > lastErrorCount.current });
        setTimeout(() => setPressed(null), 0);
        lastCharacterCount.current = characters;
        lastErrorCount.current = errors;
      }
    } else if (keymap === 'next') {
      const nextKey = letters.find(({ typed }) => !typed)?.original ?? ' ';
      setPressed({ key: nextKey });
    }
  }, [characters, keymap, words]);
  useWindowEvent('keyup', handleCapsLockShift);
  useWindowEvent('keydown', handleCapsLockShift);

  return (
    <div className='flex justify-center'>
      <div className='mt-1 flex flex-col select-none justify-center gap-1'>
        {Object.values(layout.keys).map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={twJoin([
              'flex',
              rowIndex === 4 ? 'justify-center gap-10' : 'gap-1',
              !rowIndex && hideTopRow && 'hidden',
            ])}
            style={{
              marginLeft:
                !isMatrix && rowIndex !== 4
                  ? `${1 * +(layout.type === 'iso' && rowIndex === 3) || rowIndex}rem`
                  : 0,
            }}
          >
            {row.map((key, keyIndex) =>
              rowIndex === 4 && key === ' ' ? (
                <Fragment key='space'>
                  <Tooltip className='text-xs' label='Change layout' offset={6}>
                    <Key
                      className={twJoin([
                        'cursor-pointer px-1 text-[10px] hover:border-main hover:text-main hover:duration-150 active:scale-[.925]',
                        isSplit ? (isMatrix ? 'w-[104px]' : 'w-28') : isMatrix ? 'w-36' : 'w-56',
                        !isMatrix && '-ml-5',
                      ])}
                      keymap={keymap}
                      onClick={() => commandLine.handler?.open('keymapLayout')}
                      status={getStatus(key)}
                    >
                      {!isUserTyping && (
                        <span className='line-clamp-1 text-center'>{keymapLayout}</span>
                      )}
                    </Key>
                  </Tooltip>
                  {isSplit && (
                    <Key
                      className={twJoin(isMatrix ? 'w-[104px]' : 'w-28')}
                      keymap={keymap}
                      status={getStatus(key)}
                    />
                  )}
                </Fragment>
              ) : (
                <Key
                  key={key}
                  className={twJoin(
                    rowIndex === 0 && keyIndex === 0 && 'hidden',
                    isMatrix
                      ? keyIndex > (rowIndex === 0 ? 10 : 9) && 'hidden'
                      : layout.type === 'ansi' && rowIndex === 1 && 'last-of-type:hidden'
                  )}
                  bump={rowIndex === 2 && [3, 6].includes(keyIndex)}
                  keymap={keymap}
                  order={keyIndex}
                  status={getStatus(key)}
                >
                  {getLegend(rowIndex, keyIndex)}
                </Key>
              )
            )}
            {isSplit && rowIndex !== 4 && (
              <span
                className='h-8 w-8'
                style={{
                  order:
                    (rowIndex === 0 ? (isMatrix ? 5 : 6) : 4) +
                    +(!isMatrix && layout.type === 'iso' && rowIndex === 3),
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
