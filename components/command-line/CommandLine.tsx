'use client';

import uFuzzy from '@leeoniya/ufuzzy';
import { useInputState, useIsomorphicEffect } from '@mantine/hooks';
import { Button, Key, Modal, Tooltip, Transition } from 'components/core';
import { useSettings } from 'context/settingsContext';
import { motion } from 'framer-motion';
import { useFocusLock } from 'hooks/useFocusLock';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { RiArrowDownLine, RiArrowUpLine, RiQuestionLine, RiTerminalLine } from 'react-icons/ri';
import { ViewportList, ViewportListRef } from 'react-viewport-list';
import { settingsEntries, settingsValues } from 'utils/settings';
import Item from './Item';

export interface CommandLineProps {
  open: boolean;
  onClose: () => void;
  defaultCommand?: string;
}

const uf = new uFuzzy({ intraIns: 1, interChars: '.' });
const DescriptionTooltip = ({ description }: { description: ReactNode }) => (
  <Tooltip className='max-w-[65%] text-xs' label={description} placement='left'>
    <div className='cursor-help'>
      <RiQuestionLine size={18} />
    </div>
  </Tooltip>
);

export default function CommandLine({ defaultCommand, open, onClose }: CommandLineProps) {
  const settings = useSettings();
  const { quickRestart, keyTips, setSettings } = settings;
  const [inputValue, setInputValue] = useInputState('');
  const [index, setIndex] = useState(0);
  const [command, setCommand] = useState<string | null | undefined>(defaultCommand);
  const isUsingKeyboard = useRef(false);
  const focusLockRef = useFocusLock();
  const viewportRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<ViewportListRef>(null);

  const setting = useMemo(() => {
    const [key, setting] = settingsEntries.find(([, s]) => s.command === command) ?? [];
    return key && setting && { key, ...setting };
  }, [command]);
  const items = useMemo(() => {
    let settings = settingsValues;
    let options = setting?.options ?? [];
    if (setting) {
      const haystack = setting.options.map(({ alt, value }) => `${alt ?? ''}¦${value}`);
      const indexes = uf.filter(haystack, inputValue);
      const results = indexes.map((i) => setting.options[i]);
      options = results;
    } else {
      const haystack = settingsValues.map(({ command }) => command);
      const indexes = uf.filter(haystack, inputValue);
      const results = indexes.map((i) => settingsValues[i]);
      settings = results;
    }
    return { settings, options };
  }, [inputValue, setting]);

  let selectedIndex = setting
    ? items.options.findIndex(({ value }) => value === settings[setting.key])
    : 0;
  const customSelected = selectedIndex === -1;
  selectedIndex = selectedIndex === -1 ? items.options.length : selectedIndex;
  const itemCount = setting
    ? items.options.length + +!!(setting.custom && (customSelected || inputValue))
    : items.settings.length;

  const hoverItem = (index: number) => {
    if (!isUsingKeyboard.current) setIndex(index);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
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
    } else if (e.key === 'Backspace' && !inputValue) {
      setCommand(null);
    }
    isUsingKeyboard.current = true;
  };
  const setSetting = (value: string | number | boolean) => {
    if (!setting?.key || value === '') return;
    value = typeof value === 'boolean' || isNaN(+value) ? value : +value;
    setSettings((draft) => void (draft[setting.key] = value as never));
    setInputValue('');
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (setting) {
      if (index < items.options.length) setSetting(items.options[index].value);
      else if (setting.custom) setSetting(inputValue);
    } else setCommand(items.settings[index].command);
  };

  useIsomorphicEffect(() => {
    if (open) {
      setInputValue('');
      setCommand(defaultCommand);
      setIndex(selectedIndex);
    } else isUsingKeyboard.current = true;
  }, [open]);
  useEffect(() => {
    isUsingKeyboard.current = true;
    setIndex(inputValue ? 0 : selectedIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);
  useIsomorphicEffect(() => {
    isUsingKeyboard.current = true;
    setInputValue('');
    setIndex(selectedIndex);
  }, [setting]);
  useEffect(() => {
    if (isUsingKeyboard.current) listRef.current?.scrollToIndex({ index });
  }, [index]);

  return (
    <Modal
      className='flex w-[700px] flex-col overflow-hidden p-0'
      open={open}
      onClose={onClose}
      closeOnEscape={false}
    >
      <div
        className='flex items-center gap-3 px-4 text-text transition-colors'
        onKeyDown={handleKeyDown}
      >
        {command ? (
          <Button
            className='-ml-1 px-2.5 py-1.5 text-xs font-semibold'
            component={Transition}
            variant='filled'
            active
            onClick={() => setCommand('')}
          >
            {command}
          </Button>
        ) : (
          <RiTerminalLine className='text-main' />
        )}
        <motion.form
          className='flex-1'
          layout='position'
          transition={{ duration: 0.15 }}
          onSubmit={handleSubmit}
        >
          <input
            ref={focusLockRef}
            className='w-full bg-transparent py-3.5 text-text caret-caret outline-none transition-colors'
            min={0}
            type={typeof setting?.options[0].value === 'number' ? 'number' : 'text'}
            placeholder={`type ${command ? 'value' : 'command'}`}
            value={inputValue}
            onChange={setInputValue}
            data-autofocus
          />
        </motion.form>
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
      </div>
      <motion.div
        ref={viewportRef}
        className='-mr-2 overflow-x-hidden overflow-y-scroll'
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
            {({ alt, value }, i) => (
              <Item
                key={alt ?? value}
                active={index === i}
                label={command === 'caret style' ? value || alt : alt ?? value}
                selected={selectedIndex === i}
                style={{ fontFamily: command === 'font family' ? `var(${value})` : undefined }}
                onClick={() => setSetting(value)}
                onMouseOver={() => hoverItem(i)}
              />
            )}
          </ViewportList>
        ) : (
          <ViewportList ref={listRef} viewportRef={viewportRef} items={items.settings}>
            {({ command, description }, i) => (
              <Item
                key={command}
                active={index === i}
                label={command}
                onClick={() => setCommand(command)}
                onMouseOver={() => hoverItem(i)}
              >
                {description && <DescriptionTooltip description={description} />}
              </Item>
            )}
          </ViewportList>
        )}
        {setting?.custom && (customSelected || inputValue) && (
          <Item
            layoutId='custom'
            active={index === items.options.length}
            label={`custom ${
              customSelected && !inputValue ? `(${settings[setting.key].toString()})` : ''
            }`}
            selected={customSelected && !inputValue}
            onClick={() => setSetting(inputValue)}
            onMouseMove={() => hoverItem(items.options.length)}
          />
        )}
      </motion.div>
    </Modal>
  );
}
