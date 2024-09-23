'use client';

import { ThemeBubbles } from '@/components/settings/ThemeBubbles';
import { useGlobal } from '@/context/globalContext';
import { useSettings } from '@/context/settingsContext';
import { useTheme } from '@/context/themeContext';
import { useFocusLock } from '@/hooks/useFocusLock';
import fonts from '@/utils/fonts';
import type { Settings, SettingsReference } from '@/utils/settings';
import uFuzzy from '@leeoniya/ufuzzy';
import { useInputState, useIsomorphicEffect, useWindowEvent } from '@mantine/hooks';
import { m } from 'framer-motion';
import { type FormEvent, type KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { RiArrowDownLine, RiArrowUpLine, RiLoaderLine, RiTerminalLine } from 'react-icons/ri';
import { ViewportList, type ViewportListRef } from 'react-viewport-list';
import { twJoin } from 'tailwind-merge';
import { Button } from '../Button';
import { Key } from '../Key';
import { Modal } from '../Modal';
import { Transition } from '../Transition';
import Item from './Item';

const uf = new uFuzzy({ intraIns: 1, interChars: '.' });

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: todo
export default function CommandLine() {
  const { modalOpened, commandLine } = useGlobal();
  const {
    opened,
    initialSetting,
    handler: { open, close },
  } = commandLine;
  const { settingsReference, ...settings } = useSettings();
  const { quickRestart, themeType, customThemes, keyTips, setSettings } = settings;
  const filteredSettingsReference = useMemo(
    () =>
      Object.values(settingsReference).filter(
        ({ category, hidden }) => category !== 'danger zone' && !hidden,
      ),
    [settingsReference],
  );
  const { themes, isFetching, previewTheme, clearPreview } = useTheme();
  const [input, setInput] = useInputState('');
  const [index, setIndex] = useState(0);
  const [setting, setSetting] = useState<(typeof filteredSettingsReference)[number] | null>();
  const isThemeSetting = setting && ['theme', 'customTheme'].includes(setting.id);
  const isUsingKeyboard = useRef(true);
  const focusLockRef = useFocusLock();
  const viewportRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<ViewportListRef>(null);

  const items = useMemo(() => {
    const settings = filteredSettingsReference;
    const options = setting?.options ?? [];
    if (setting) {
      const haystack = options.map(({ alt, value }) => `${alt ?? ''}¦${value}`);
      const indexes = uf.filter(haystack, input);
      const results = indexes?.map((i) => options[i]);
      return { settings: [] as typeof settings, options: results ?? options };
    }
    const haystack = settings.map(({ command }) => command);
    const indexes = uf.filter(haystack, input);
    const results = indexes?.map((i) => settings[i]);
    return { settings: results ?? settings, options: [] as typeof options };
  }, [input, setting, filteredSettingsReference]);

  let selectedIndex = setting
    ? items.options.findIndex(({ value }) => value === settings[setting.id])
    : 0;
  const customSelected = selectedIndex === -1;
  selectedIndex = selectedIndex === -1 ? items.options.length : selectedIndex;
  const itemCount = setting
    ? items.options.length + +!!(setting.custom && (customSelected || input))
    : items.settings.length;

  const hoverItem = (index: number) => !isUsingKeyboard.current && setIndex(index);
  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if ((quickRestart !== 'esc' && e.key === 'Tab') || e.key === 'ArrowDown') {
      e.preventDefault();
      setIndex((index) => (index + 1) % itemCount);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndex((index) => (index - 1 < 0 ? itemCount - 1 : index - 1));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setIndex(itemCount - 1);
    } else if (e.key === 'Backspace' && !input) {
      setSetting(undefined);
    }
    isUsingKeyboard.current = true;
  };
  const saveSetting = (value: Settings[keyof Settings]) => {
    if (!setting?.id || value === '') return;
    setSettings({ [setting.id]: value });
    setInput('');
  };
  const select = (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (setting) {
      if (setting.custom && index === items.options.length)
        saveSetting(Number.isNaN(+input) ? input : +input);
      else saveSetting(items.options[index].value);
    } else if (items.settings[index].id === 'theme' && themeType === 'custom')
      setSetting(settingsReference.customTheme);
    else setSetting(items.settings[index]);
  };
  const toggleThemeType = () => {
    if (themeType === 'preset' && customThemes.length) {
      setSettings({ themeType: 'custom' });
      setSetting(settingsReference.customTheme);
    } else {
      setSettings({ themeType: 'preset' });
      setSetting(settingsReference.theme);
    }
  };

  useIsomorphicEffect(() => {
    if (opened)
      setSetting(
        initialSetting ? settingsReference[initialSetting as keyof SettingsReference] : null,
      );
    else {
      clearPreview();
      setInput('');
    }
  }, [opened]);
  useIsomorphicEffect(() => {
    isUsingKeyboard.current = true;
    clearPreview();
    setInput('');
    setIndex(selectedIndex);
  }, [setting]);
  useEffect(() => {
    setIndex(input ? 0 : selectedIndex);
  }, [input, selectedIndex]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: not needed
  useEffect(() => {
    if (isUsingKeyboard.current) listRef.current?.scrollToIndex({ index });
    if (
      (setting?.id === 'theme' || setting?.id === 'customTheme') &&
      typeof items.options[index].value === 'string'
    )
      previewTheme(items.options[index].value);
  }, [index]);
  useWindowEvent('keydown', (event) => {
    if (event.key === (quickRestart !== 'esc' ? 'Escape' : 'Tab') && (!modalOpened || opened))
      if (opened) close();
      else open();
    if (opened && event.key === 'Control' && isThemeSetting) toggleThemeType();
  });

  return (
    <Modal
      className='flex w-[700px] flex-col overflow-hidden p-0'
      opened={opened}
      onClose={close}
      centered={false}
      closeOnEscape={false}
    >
      <form
        className='flex items-center gap-3 px-4 text-text transition-colors'
        onKeyDown={handleKeyDown}
        onSubmit={select}
      >
        {setting?.command ? (
          <Button
            asChild
            className='-ml-1 px-2.5 py-1.5 font-semibold text-xs'
            active
            onClick={() => setSetting(undefined)}
          >
            <Transition>{isThemeSetting ? 'theme' : setting.command}</Transition>
          </Button>
        ) : (
          <RiTerminalLine className='text-main' />
        )}
        {isThemeSetting && (setting.id === 'customTheme' || !!customThemes.length) && (
          <Button asChild className='-ml-1 px-2.5 py-1.5 text-xs' onClick={toggleThemeType}>
            <Transition>
              {themeType}
              {keyTips && <Key>ctrl</Key>}
            </Transition>
          </Button>
        )}
        <m.input
          ref={focusLockRef}
          className='flex-1 border-0 bg-transparent py-3.5 text-text caret-caret outline-0 transition-colors placeholder:text-sub'
          min={0}
          type={setting?.custom && typeof setting.options[0].value === 'number' ? 'number' : 'text'}
          placeholder={`type ${setting ? 'value' : 'command'}`}
          value={input}
          layout='position'
          transition={{ duration: 0.15 }}
          onChange={setInput}
          data-autofocus
        />
        {items.settings.length || items.options.length || setting?.custom ? (
          keyTips && (
            <m.div
              className='flex cursor-default items-center gap-1 text-sub text-xs'
              layout
              transition={{ duration: 0.15 }}
            >
              navigate
              <Key className='py-0.5'>
                <RiArrowUpLine />
              </Key>
              <Key className='py-0.5'>
                <RiArrowDownLine />
              </Key>
              <Key>home</Key>
              <Key>end</Key>
            </m.div>
          )
        ) : (
          <div className='cursor-default text-sm text-sub'>nothing found</div>
        )}
      </form>
      <m.div
        ref={viewportRef}
        className='overflow-x-hidden overflow-y-scroll'
        animate={{ height: itemCount * 36 }}
        transition={{ ease: 'easeOut', duration: 0.2 }}
        onMouseMove={() => {
          isUsingKeyboard.current = false;
        }}
      >
        {setting ? (
          <ViewportList
            ref={listRef}
            viewportRef={viewportRef}
            items={items.options}
            initialIndex={selectedIndex}
          >
            {/* biome-ignore lint/complexity/noExcessiveCognitiveComplexity: todo */}
            {({ alt, value }, i) => {
              const key = typeof value === 'string' ? value : alt ?? `${value}`;
              const active = index === i;
              const selected = selectedIndex === i;
              return (
                <Item
                  key={key}
                  active={active}
                  className={twJoin(
                    setting.id === 'fontFamily' && fonts[value as string].className,
                  )}
                  label={(setting.id === 'caretStyle' ? value || alt : alt ?? value)?.toString()}
                  selected={selected && !(isFetching && active)}
                  layoutId={`cli-${key}`}
                  onClick={() => select()}
                  onMouseMove={() => hoverItem(i)}
                >
                  {isThemeSetting && (
                    <>
                      {isFetching && active && <RiLoaderLine className='animate-spin' size={18} />}
                      {!selected && (
                        <ThemeBubbles
                          colors={
                            setting.id === 'customTheme'
                              ? customThemes.find(({ id }) => value === id)?.colors ?? {}
                              : { ...themes[`${value}`] }
                          }
                          withBackground
                        />
                      )}
                    </>
                  )}
                </Item>
              );
            }}
          </ViewportList>
        ) : (
          <ViewportList ref={listRef} viewportRef={viewportRef} items={items.settings}>
            {({ id, command, description }, i) => (
              <Item
                key={id}
                active={index === i}
                description={description}
                label={command}
                onClick={() => select()}
                onMouseMove={() => hoverItem(i)}
              />
            )}
          </ViewportList>
        )}
        {setting?.custom && (customSelected || input) && (
          <Item
            layoutId='custom'
            active={index === items.options.length}
            label={`custom ${
              customSelected && !input ? `(${settings[setting.id]?.toString()})` : ''
            }`}
            selected={customSelected && !input}
            onClick={() => select()}
            onMouseMove={() => hoverItem(items.options.length)}
          />
        )}
      </m.div>
    </Modal>
  );
}
