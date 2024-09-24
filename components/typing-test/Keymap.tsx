'use client';

import { Tooltip } from '@/components/core/Tooltip';
import { useGlobal } from '@/context/globalContext';
import { useSettings } from '@/context/settingsContext';
import { useTypingTest } from '@/context/typingTestContext';
import { layoutListOptions } from '@/queries/get-layout-list';
import { replaceSpaces } from '@/utils/misc';
import type { Settings } from '@/utils/settings';
import { useDidUpdate, useMergedRef, useTimeout, useWindowEvent } from '@mantine/hooks';
import { useQuery } from '@tanstack/react-query';
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  Fragment,
  forwardRef,
  memo,
  useRef,
  useState,
} from 'react';
import { twJoin, twMerge } from 'tailwind-merge';

interface KeyProps extends ComponentPropsWithoutRef<'div'> {
  bump?: boolean;
  blindMode: Settings['blindMode'];
  keymap?: Settings['keymap'];
  order?: number;
  status: boolean | 'error';
}

const Key = memo(
  forwardRef<ElementRef<'div'>, KeyProps>(function Key(
    { bump, children, className, blindMode, keymap, order, status, style, ...props },
    ref,
  ) {
    const keyRef = useRef<HTMLDivElement>(null);
    const mergedRef = useMergedRef(ref, keyRef);
    const setStatus = (status?: boolean | 'error') => {
      if (keyRef.current) {
        if (status) keyRef.current.dataset.status = status.toString();
        else delete keyRef.current.dataset.status;
      }
    };
    const { start, clear } = useTimeout(() => setStatus(), 50);

    useDidUpdate(() => {
      if (keymap === 'react') {
        if (status) {
          clear();
          setStatus(status);
        }
        start();
      } else setStatus(status);
    }, [status]);

    return (
      <div
        ref={mergedRef}
        className={twMerge(
          'group relative flex h-8 w-8 items-center justify-center rounded-lg border border-sub text-sub transition data-[status]:border-main data-[status]:bg-main data-[status]:text-bg data-[status]:duration-0',
          keymap === 'react' ? 'duration-300 data-[status]:scale-[.925]' : 'duration-150',
          !blindMode && 'data-[status=error]:!border-error data-[status=error]:!bg-error',
          className,
        )}
        style={{ order, ...style }}
        {...props}
      >
        {children}
        {bump && (
          <span
            className={twJoin(
              'absolute bottom-[0.2rem] h-px w-2 bg-sub transition group-data-[status]:bg-bg group-data-[status]:duration-0',
              keymap === 'react' ? 'duration-300' : 'duration-150',
            )}
          />
        )}
      </div>
    );
  }),
);

export function Keymap() {
  const { capsLock, isUserTyping, commandLine } = useGlobal();
  const { blindMode, keymap, keymapLayout, keymapStyle, keymapLegendStyle, keymapShowTopRow } =
    useSettings();
  const { words, wordIndex, lastCharacter, stats } = useTypingTest();
  const { characters, errors } = stats;
  const { data: layouts = {} } = useQuery(layoutListOptions);
  const [pressed, setPressed] = useState<{ key?: string; error?: boolean } | null>(null);
  const [shift, setShift] = useState(false);
  const layout = layouts[replaceSpaces(keymapLayout)];
  const isMatrix = keymapStyle.includes('matrix');
  const isSplit = keymapStyle.includes('split');
  const hideTopRow =
    (keymapShowTopRow === 'layout dependent' && !layout.keymapShowTopRow) || !keymapShowTopRow;
  const lastCharacterCount = useRef(0);
  const lastErrorCount = useRef(0);

  const handleShift = (e: KeyboardEvent) => {
    setShift(e.shiftKey);
  };
  const getStatus = (key: string) => {
    if (pressed?.key && key.includes(pressed.key)) return pressed.error ? 'error' : true;
    return false;
  };
  const getLegend = (rowIndex: number, keyIndex: number) => {
    const key = Object.values(layout.keys)[rowIndex][keyIndex];
    if (!key) return null;
    const isLetter = !!key.match(/\p{L}/gu);
    switch (keymapLegendStyle) {
      case 'lowercase':
        return key[0];
      case 'uppercase':
        return key[+isLetter];
      case 'dynamic':
        return isLetter ? key[+(capsLock ? !shift : shift)] : key[+shift];
    }
    return null;
  };

  useDidUpdate(() => {
    if (!words[wordIndex]) return;
    const { letters } = words[wordIndex];
    setPressed(null);
    if (keymap === 'react') {
      if (characters > lastCharacterCount.current) {
        setPressed({ key: lastCharacter, error: errors > lastErrorCount.current });
        setTimeout(() => setPressed(null), 0);
        lastCharacterCount.current = characters;
        lastErrorCount.current = errors;
      }
    } else if (keymap === 'next') {
      const nextKey = letters.find(({ typed }) => !typed)?.original ?? ' ';
      setPressed({ key: nextKey });
    }
  }, [characters, keymap, words]);
  useWindowEvent('keydown', handleShift);
  useWindowEvent('keyup', handleShift);

  return (
    <div className='flex justify-center'>
      <div className='mt-1 flex select-none flex-col justify-center gap-1'>
        {Object.values(layout.keys).map((row, rowIndex) => (
          <div
            key={row[0]}
            className={twMerge(
              'flex',
              rowIndex === 4 ? 'justify-center gap-10' : 'gap-1',
              !rowIndex && hideTopRow && 'hidden',
            )}
            style={{
              marginLeft:
                !isMatrix && rowIndex !== 4
                  ? `${1 * +(layout.type === 'iso' && rowIndex === 3) || rowIndex}rem`
                  : 0,
            }}
          >
            {/* biome-ignore lint/complexity/noExcessiveCognitiveComplexity: todo */}
            {row.map((key, keyIndex) =>
              rowIndex === 4 && key === ' ' ? (
                <Fragment key='space'>
                  <Tooltip className='text-xs' label='Change layout' offset={6}>
                    <Key
                      className={twJoin(
                        'cursor-pointer px-1 text-[10px] hover:border-main hover:text-main hover:duration-150 active:scale-[.925]',
                        isSplit ? (isMatrix ? 'w-[104px]' : 'w-28') : isMatrix ? 'w-36' : 'w-56',
                        !isMatrix && '-ml-5',
                      )}
                      blindMode={blindMode}
                      keymap={keymap}
                      onClick={() => commandLine.handler.open('keymapLayout')}
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
                      blindMode={blindMode}
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
                      : layout.type === 'ansi' && rowIndex === 1 && 'last-of-type:hidden',
                  )}
                  bump={rowIndex === 2 && [3, 6].includes(keyIndex)}
                  blindMode={blindMode}
                  keymap={keymap}
                  order={keyIndex}
                  status={getStatus(key)}
                >
                  {getLegend(rowIndex, keyIndex)}
                </Key>
              ),
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
