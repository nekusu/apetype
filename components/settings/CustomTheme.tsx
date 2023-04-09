'use client';

import { useDidUpdate, useInputState } from '@mantine/hooks';
import { Button, ColorPicker, Input, Text, Transition } from 'components/core';
import { ButtonProps } from 'components/core/Button';
import { useSettings } from 'context/settingsContext';
import { useTheme } from 'context/themeContext';
import { AnimatePresence, HTMLMotionProps } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { RiDeleteBin7Line } from 'react-icons/ri';
import { twMerge } from 'tailwind-merge';
import { useImmer } from 'use-immer';
import { CustomTheme, ThemeColors, themeColorVariables } from 'utils/theme';
import ThemeButton from './ThemeButton';

type Color = keyof ThemeColors;

const COMMON_BUTTON_PROPS: Omit<ButtonProps, 'ref'> = { className: 'w-full', variant: 'filled' };
const LABELS: ThemeColors = {
  bg: 'background',
  main: 'main',
  caret: 'caret',
  sub: 'sub',
  subAlt: 'sub alt',
  text: 'text',
  error: 'error',
  errorExtra: 'error extra',
  colorfulError: 'colorful error',
  colorfulErrorExtra: 'colorful error extra',
};
const initialColors = Object.keys(themeColorVariables).reduce((colors, key) => {
  colors[key as Color] = '';
  return colors;
}, {} as ThemeColors);

interface ColorInputProps {
  color: Color;
  value: string;
  setValue: (value: string) => void;
}

function ColorInput({ color, value, setValue }: ColorInputProps) {
  return (
    <Input
      label={LABELS[color]}
      leftNode={<ColorPicker color={value} onChange={(color) => setValue(color)} />}
      value={value}
      onChange={({ target: { value } }) => setValue(value)}
    />
  );
}

export default function CustomTheme({ className, ...props }: HTMLMotionProps<'div'>) {
  const { theme, customThemes, customTheme: customThemeId, setSettings } = useSettings();
  const { colors } = useTheme();
  const [name, setName] = useInputState('');
  const [inputColors, setInputColors] = useImmer(initialColors);
  const themeButtonRef = useRef<HTMLButtonElement>(null);
  const customTheme = customThemes.find(({ id }) => id === customThemeId);

  const addTheme = (theme: Omit<CustomTheme, 'id'>) => {
    const id = crypto.randomUUID();
    setSettings((draft) => {
      if (!draft.customThemes.some((theme) => theme.id === id)) {
        draft.customThemes.push({ ...theme, id });
        draft.customThemes.sort((a, b) => a.name.localeCompare(b.name));
        draft.customTheme = id;
      }
    });
  };
  const deleteTheme = (id: string) => {
    setSettings((draft) => {
      if (id === draft.customTheme) {
        const index = draft.customThemes.findIndex(({ id }) => id === draft.customTheme);
        draft.customTheme = draft.customThemes[index > 0 ? index - 1 : index + 1]?.id;
      }
      draft.customThemes = draft.customThemes.filter((theme) => theme.id !== id);
    });
  };
  const duplicateTheme = () => {
    if (!customTheme) return;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...theme } = customTheme;
    addTheme(theme);
  };
  const shareTheme = () => {
    const encodedTheme = Buffer.from(JSON.stringify(customTheme)).toString('base64');
    void navigator.clipboard.writeText(`${window.location.origin}?customTheme=${encodedTheme}`);
  };
  const saveTheme = () => {
    setSettings((draft) => {
      const index = draft.customThemes.findIndex(({ id }) => id === draft.customTheme);
      if (index >= 0) {
        draft.customThemes[index].name = name;
        draft.customThemes[index].colors = inputColors;
        draft.customThemes.sort((a, b) => a.name.localeCompare(b.name));
      }
    });
  };

  const CreateThemeButton = ({ className }: ButtonProps) => (
    <Button
      className={className}
      variant='filled'
      onClick={() => {
        if (!colors.preset) return;
        setName(theme);
        setInputColors(colors.preset);
        addTheme({ name: theme, colors: colors.preset });
      }}
    >
      create theme
    </Button>
  );

  useDidUpdate(() => {
    themeButtonRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [customTheme]);
  useEffect(() => {
    if (customTheme) {
      setName(customTheme.name);
      setInputColors(customTheme.colors);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customTheme]);

  return (
    <Transition
      className={twMerge([
        customThemes.length ? 'grid grid-cols-[1fr_3fr] gap-5' : 'flex flex-col items-center gap-3',
        className,
      ])}
      {...props}
    >
      {customThemes.length ? (
        <>
          <div className='relative'>
            <div className='absolute inset-0 flex flex-col gap-4'>
              <CreateThemeButton className='w-full' />
              <div className='flex h-full flex-col gap-2 overflow-y-auto pt-0.5'>
                <AnimatePresence>
                  {customThemes.map(({ id, name, colors }) => (
                    <Transition key={id} layoutId={id}>
                      <ThemeButton
                        ref={id === customThemeId ? themeButtonRef : null}
                        leftNode={
                          <RiDeleteBin7Line
                            color={colors.error}
                            size={16}
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTheme(id);
                            }}
                          />
                        }
                        name={name}
                        selected={id === customThemeId}
                        onClick={() => setSettings((draft) => void (draft.customTheme = id))}
                        colors={colors}
                      />
                    </Transition>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
          <form
            className='grid grid-cols-4 gap-x-2 gap-y-3'
            onSubmit={(e) => {
              e.preventDefault();
              saveTheme();
            }}
          >
            <Input
              wrapperClassName='col-span-2'
              label='name'
              value={name}
              onChange={setName}
              required
            />
            {Object.entries(inputColors).map(([key, value]) => (
              <ColorInput
                key={key}
                color={key}
                value={value}
                setValue={(value) => setInputColors((draft) => void (draft[key] = value))}
              />
            ))}
            <div className='col-span-full mt-3 flex gap-2'>
              <Button
                className='w-full'
                variant='danger'
                onClick={() => customThemeId && deleteTheme(customThemeId)}
              >
                delete
              </Button>
              <Button onClick={duplicateTheme} {...COMMON_BUTTON_PROPS}>
                duplicate
              </Button>
              <Button onClick={shareTheme} {...COMMON_BUTTON_PROPS}>
                share
              </Button>
              <Button type='submit' {...COMMON_BUTTON_PROPS}>
                save
              </Button>
            </div>
          </form>
        </>
      ) : (
        <>
          <Text className='text-center' dimmed>
            Looks like you don&apos;t have any custom theme yet.
          </Text>
          <CreateThemeButton className='px-3' />
        </>
      )}
    </Transition>
  );
}
