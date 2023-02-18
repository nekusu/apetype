'use client';

import { useInputState } from '@mantine/hooks';
import { Button, Key, Modal, Tooltip, Transition } from 'components/core';
import { useSettings } from 'context/settingsContext';
import { motion } from 'framer-motion';
import Fuse from 'fuse.js';
import { useFocusLock } from 'hooks/useFocusLock';
import { ReactNode, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { RiArrowDownLine, RiArrowUpLine, RiQuestionLine, RiTerminalLine } from 'react-icons/ri';
import { settingsEntries, settingsValues } from 'utils/settings';
import Item from './Item';

export interface CommandLineProps {
  open: boolean;
  onClose: () => void;
  defaultCommand?: string;
}

const SEARCH_OPTIONS = { threshold: 0.4 };
const fuseSettings = new Fuse(settingsValues, { keys: ['command'], ...SEARCH_OPTIONS });
const DescriptionTooltip = ({ description }: { description: ReactNode }) => (
  <Tooltip className='max-w-[65%] text-xs' label={description} placement='left'>
    <div className='cursor-help'>
      <RiQuestionLine size={18} />
    </div>
  </Tooltip>
);

export default function CommandLine({ defaultCommand, open, onClose }: CommandLineProps) {
  const settings = useSettings();
  const { quickRestart, setSettings } = settings;
  const [inputValue, setInputValue] = useInputState('');
  const [index, setIndex] = useState(0);
  const [command, setCommand] = useState<string | null | undefined>(defaultCommand);
  const isUsingKeyboard = useRef(false);
  const focusLockRef = useFocusLock();
  const listRef = useRef<HTMLDivElement>(null);

  const { setting, fuseOptions } = useMemo(() => {
    const [key, setting] = settingsEntries.find(([, s]) => s.command === command) ?? [];
    const options = setting?.options;
    const fuseOptions = options && new Fuse(options, { keys: ['alt', 'value'], ...SEARCH_OPTIONS });
    return { setting: key && setting && { key, ...setting }, fuseOptions };
  }, [command]);
  const items = useMemo(() => {
    if (setting && fuseOptions) {
      const results = fuseOptions.search(inputValue).map(({ item }) => item);
      return { settings: [], options: results.length || inputValue ? results : setting.options };
    } else {
      const results = fuseSettings.search(inputValue).map(({ item }) => item);
      return { settings: results.length || inputValue ? results : settingsValues, options: [] };
    }
  }, [fuseOptions, inputValue, setting]);
  const customSetting = !setting?.options.find(({ value }) => value === settings[setting.key]);
  const itemsLength =
    items.options.length + +!!(setting?.custom && (customSetting || inputValue)) ||
    items.settings.length;

  const hoverItem = (index: number) => {
    if (!isUsingKeyboard.current) setIndex(index);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((quickRestart !== 'esc' && e.key === 'Tab') || e.key === 'ArrowDown') {
      e.preventDefault();
      setIndex((index) => (index + 1) % itemsLength);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndex((index) => (index - 1 < 0 ? itemsLength - 1 : index - 1));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setIndex(itemsLength - 1);
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
    if (setting)
      setSetting(index === items.options.length ? inputValue : items.options[index].value);
    else setCommand(items.settings[index].command);
  };

  useEffect(() => {
    setInputValue('');
    setIndex(0);
    setCommand(defaultCommand);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  useEffect(() => {
    isUsingKeyboard.current = true;
    setIndex(0);
  }, [inputValue]);
  useLayoutEffect(() => {
    setInputValue('');
    setIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [command]);
  useEffect(() => {
    listRef.current?.children[index]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
          layout
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
        ) : (
          <div className='cursor-default text-sm text-sub'>nothing found</div>
        )}
        {setting?.description && <DescriptionTooltip description={setting.description} />}
      </div>
      <motion.div
        ref={listRef}
        className='-mr-2 overflow-x-hidden overflow-y-scroll'
        animate={{ height: itemsLength * 36 }}
        transition={{ ease: 'easeOut', duration: 0.2 }}
        onMouseMove={() => (isUsingKeyboard.current = false)}
      >
        {setting ? (
          <>
            {items.options.map(({ alt, value }, i) => {
              const selected = value === settings[setting.key];
              return (
                <Item
                  key={value}
                  active={index === i}
                  label={command === 'caret style' ? value || alt : alt ?? value}
                  selected={selected}
                  style={{ fontFamily: command === 'font family' ? `var(${value})` : 'inherit' }}
                  onClick={() => setSetting(value)}
                  onMouseOver={() => hoverItem(i)}
                />
              );
            })}
            {setting.custom && (customSetting || inputValue) && (
              <Item
                layoutId='custom'
                active={index === items.options.length}
                label={`custom ${
                  customSetting && !inputValue ? `(${settings[setting.key].toString()})` : ''
                }`}
                selected={customSetting && !inputValue}
                onClick={() => setSetting(inputValue)}
                onMouseOver={() => hoverItem(items.options.length)}
              />
            )}
          </>
        ) : (
          items.settings.map(({ command, description }, i) => (
            <Item
              key={command}
              active={index === i}
              label={command}
              onClick={() => setCommand(command)}
              onMouseOver={() => hoverItem(i)}
            >
              {description && <DescriptionTooltip description={description} />}
            </Item>
          ))
        )}
      </motion.div>
    </Modal>
  );
}
