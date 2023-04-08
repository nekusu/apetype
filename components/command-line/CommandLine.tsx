'use client';

import uFuzzy from '@leeoniya/ufuzzy';
import { useInputState, useIsomorphicEffect, useWindowEvent } from '@mantine/hooks';
import { Button, Key, Modal, Tooltip, Transition } from 'components/core';
import { ThemeBubbles } from 'components/settings';
import { useGlobal } from 'context/globalContext';
import { useSettings } from 'context/settingsContext';
import { useTheme } from 'context/themeContext';
import { motion } from 'framer-motion';
import { useFocusLock } from 'hooks/useFocusLock';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  RiArrowDownLine,
  RiArrowUpLine,
  RiLoaderLine,
  RiQuestionLine,
  RiTerminalLine,
} from 'react-icons/ri';
import { ViewportList, ViewportListRef } from 'react-viewport-list';
import Item from './Item';

const uf = new uFuzzy({ intraIns: 1, interChars: '.' });
const DescriptionTooltip = ({ description }: { description: ReactNode }) => (
  <Tooltip className='max-w-[65%] text-xs' label={description} placement='left'>
    <div className='cursor-help'>
      <RiQuestionLine size={18} />
    </div>
  </Tooltip>
);

export default function CommandLine() {
  const { modalOpen, settingsList, commandLine, setGlobalValues } = useGlobal();
  const { open, initialSetting, handler } = commandLine;
  const settingsListValues = useMemo(() => Object.values(settingsList), [settingsList]);
  const settings = useSettings();
  const { quickRestart, keyTips, setSettings } = settings;
  const { themes, isLoading, previewTheme, clearPreview } = useTheme();
  const [input, setInput] = useInputState('');
  const [index, setIndex] = useState(0);
  const [setting, setSetting] = useState<(typeof settingsListValues)[number] | undefined>();
  const isUsingKeyboard = useRef(true);
  const focusLockRef = useFocusLock();
  const viewportRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<ViewportListRef>(null);

  const items = useMemo(() => {
    const settings = settingsListValues;
    const options = setting?.options ?? [];
    if (setting) {
      const haystack = options.map(({ alt, value }) => `${alt ?? ''}¦${value.toString()}`);
      const indexes = uf.filter(haystack, input);
      const results = indexes?.map((i) => options[i]);
      return { settings, options: results ?? options };
    } else {
      const haystack = settingsListValues.map(({ command }) => command);
      const indexes = uf.filter(haystack, input);
      const results = indexes?.map((i) => settingsListValues[i]);
      return { settings: results ?? settings, options };
    }
  }, [input, setting, settingsListValues]);

  let selectedIndex = setting
    ? items.options.findIndex(({ value }) => value === settings[setting.id])
    : 0;
  const customSelected = selectedIndex === -1;
  selectedIndex = selectedIndex === -1 ? items.options.length : selectedIndex;
  const itemCount = setting
    ? items.options.length + +!!(setting.custom && (customSelected || input))
    : items.settings.length;

  const hoverItem = (index: number) => !isUsingKeyboard.current && setIndex(index);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
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
  const saveSetting = (value: string | number | boolean) => {
    if (!setting?.id || value === '') return;
    setSettings((draft) => void (draft[setting.id] = value as never));
    setInput('');
  };
  const select = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (setting) {
      if (setting.custom && index === items.options.length)
        saveSetting(isNaN(+input) ? input : +input);
      else saveSetting(items.options[index].value);
    } else setSetting(items.settings[index]);
  };

  useIsomorphicEffect(() => {
    if (open && initialSetting) setSetting(settingsList[initialSetting]);
    else {
      clearPreview();
      setInput('');
    }
  }, [open]);
  useIsomorphicEffect(() => {
    isUsingKeyboard.current = true;
    clearPreview();
    setInput('');
    setIndex(selectedIndex);
  }, [setting]);
  useEffect(() => {
    setIndex(input ? 0 : selectedIndex);
  }, [input, selectedIndex]);
  useEffect(() => {
    if (isUsingKeyboard.current) listRef.current?.scrollToIndex({ index });
    if (setting?.id === 'theme') previewTheme(items.options[index].value.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);
  useWindowEvent('keydown', (event) => {
    setGlobalValues((draft) => void (draft.capsLock = event.getModifierState('CapsLock')));
    if (event.key === (quickRestart !== 'esc' ? 'Escape' : 'Tab') && (!modalOpen || open))
      if (open) handler?.close();
      else handler?.open();
  });

  return (
    <Modal
      className='flex w-[700px] flex-col overflow-hidden p-0'
      open={open}
      onClose={handler?.close}
      closeOnEscape={false}
    >
      <form
        className='flex items-center gap-3 px-4 text-text transition-colors'
        onKeyDown={handleKeyDown}
        onSubmit={select}
      >
        {setting?.command ? (
          <Button
            className='-ml-1 px-2.5 py-1.5 text-xs font-semibold'
            component={Transition}
            variant='filled'
            active
            onClick={() => setSetting(undefined)}
          >
            {setting.command}
          </Button>
        ) : (
          <RiTerminalLine className='text-main' />
        )}
        <motion.input
          ref={focusLockRef}
          className='flex-1 bg-transparent py-3.5 text-text caret-caret outline-none transition-colors'
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
            <motion.div
              className='flex cursor-default items-center gap-1 text-xs text-sub'
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
            </motion.div>
          )
        ) : (
          <div className='cursor-default text-sm text-sub'>nothing found</div>
        )}
        {setting?.description && <DescriptionTooltip description={setting.description} />}
      </form>
      <motion.div
        ref={viewportRef}
        className='overflow-x-hidden overflow-y-scroll'
        animate={{ height: itemCount * 36 }}
        transition={{ ease: 'easeOut', duration: 0.2 }}
        onMouseMove={() => (isUsingKeyboard.current = false)}
      >
        {setting ? (
          <ViewportList
            ref={listRef}
            viewportRef={viewportRef}
            items={items.options}
            initialIndex={selectedIndex}
          >
            {({ alt, value }, i) => {
              const active = index === i;
              const selected = selectedIndex === i;
              return (
                <Item
                  key={alt ?? value.toString()}
                  active={active}
                  label={(setting.id === 'caretStyle' ? value || alt : alt ?? value)?.toString()}
                  selected={selected && (!isLoading || !active)}
                  style={{
                    fontFamily:
                      setting.id === 'fontFamily' ? `var(${value.toString()})` : undefined,
                  }}
                  onClick={() => select()}
                  onMouseMove={() => hoverItem(i)}
                >
                  {setting.id === 'theme' && (
                    <>
                      {isLoading && active && <RiLoaderLine className='animate-spin' size={18} />}
                      {!selected && <ThemeBubbles withBackground {...themes[value.toString()]} />}
                    </>
                  )}
                </Item>
              );
            }}
          </ViewportList>
        ) : (
          <ViewportList ref={listRef} viewportRef={viewportRef} items={items.settings}>
            {(setting, i) => (
              <Item
                key={setting.id}
                active={index === i}
                label={setting.command}
                onClick={() => select()}
                onMouseMove={() => hoverItem(i)}
              >
                {setting.description && <DescriptionTooltip description={setting.description} />}
              </Item>
            )}
          </ViewportList>
        )}
        {setting?.custom && (customSelected || input) && (
          <Item
            layoutId='custom'
            active={index === items.options.length}
            label={`custom ${
              customSelected && !input ? `(${settings[setting.id].toString()})` : ''
            }`}
            selected={customSelected && !input}
            onClick={() => select()}
            onMouseMove={() => hoverItem(items.options.length)}
          />
        )}
      </motion.div>
    </Modal>
  );
}
