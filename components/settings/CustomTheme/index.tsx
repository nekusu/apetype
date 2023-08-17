'use client';

import { useDidUpdate, useDisclosure, useInputState, useToggle } from '@mantine/hooks';
import { colord, extend } from 'colord';
import a11yPlugin from 'colord/plugins/a11y';
import { Button, Input, Text, Tooltip, Transition } from 'components/core';
import { ButtonProps } from 'components/core/Button';
import { ThemeButton } from 'components/settings';
import { useSettings } from 'context/settingsContext';
import { useTheme } from 'context/themeContext';
import { AnimatePresence, HTMLMotionProps } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { RiAlertLine, RiDeleteBin7Line, RiPaintBrushFill, RiSparklingFill } from 'react-icons/ri';
import { twMerge } from 'tailwind-merge';
import { useImmer } from 'use-immer';
import { CustomTheme, ThemeColors, themeColorVariables, validateColor } from 'utils/theme';
import AIThemeGenerationModal from './AIThemeGenerationModal';
import ColorInput from './ColorInput';
import ReadabilityModal from './ReadabilityModal';

type Color = keyof ThemeColors;

extend([a11yPlugin]);

const COMMON_BUTTON_PROPS: Omit<ButtonProps, 'ref'> = { className: 'w-full', variant: 'filled' };
const initialColors = Object.keys(themeColorVariables).reduce((colors, key) => {
  colors[key as Color] = '';
  return colors;
}, {} as ThemeColors);

export default function CustomTheme({ className, ...props }: HTMLMotionProps<'div'>) {
  const { theme, customThemes, customTheme: customThemeId, setSettings } = useSettings();
  const { colors } = useTheme();
  const [themeCreation, toggleThemeCreation] = useToggle(['AI', 'preset']);
  const [name, setName] = useInputState('');
  const [inputColors, setInputColors] = useImmer(initialColors);
  const [themeModalOpen, themeModalHandler] = useDisclosure(false);
  const [readabilityModalOpen, readabilityModalHandler] = useDisclosure(false);
  const themeButtonRef = useRef<HTMLButtonElement>(null);
  const customTheme = customThemes.find(({ id }) => id === customThemeId);

  const addTheme = (theme: Optional<CustomTheme, 'id'>) => {
    const id = theme.id ?? crypto.randomUUID();
    setSettings((draft) => {
      if (!draft.customThemes.some((theme) => theme.id === id)) {
        draft.customThemes.push({ ...theme, id });
        draft.customThemes.sort((a, b) => a.name.localeCompare(b.name));
        if (!theme.id) draft.customTheme = id;
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
  const showRestoreThemeToast = (theme: CustomTheme) => {
    toast(
      (t) => (
        <div className='flex flex-col gap-2'>
          <Text className='leading-tight'>Custom theme &apos;{theme.name}&apos; deleted!</Text>
          <div className='flex gap-2'>
            <Button className='w-full' variant='subtle' onClick={() => toast.dismiss(t.id)}>
              dismiss
            </Button>
            <Button active className='w-full' variant='filled' onClick={() => addTheme(theme)}>
              restore theme
            </Button>
          </div>
        </div>
      ),
      { duration: 8000 },
    );
  };
  const duplicateTheme = () => {
    if (!customTheme) return;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...theme } = customTheme;
    addTheme(theme);
  };
  const shareTheme = () => {
    const encodedTheme = Buffer.from(JSON.stringify(customTheme)).toString('base64');
    void navigator.clipboard
      .writeText(`${window.location.origin}?customTheme=${encodedTheme}`)
      .then(() => toast.success('URL copied to clipboard!'))
      .catch(() => toast.error('Failed to copy URL to clipboard. Please try again.'));
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

  const CreateThemeButton = () => (
    <div className='flex gap-2'>
      <Button
        className='col-span-full w-full px-3'
        variant='filled'
        onClick={() => {
          if (themeCreation === 'AI') themeModalHandler.open();
          else {
            if (!colors.preset) return;
            setName(theme);
            setInputColors(colors.preset);
            addTheme({ name: theme, colors: colors.preset });
          }
        }}
      >
        create theme
      </Button>
      <Tooltip label={themeCreation === 'AI' ? 'Generate with AI' : 'Load from preset'}>
        <Button active className='px-2.5' variant='filled' onClick={() => toggleThemeCreation()}>
          {themeCreation === 'AI' ? <RiSparklingFill /> : <RiPaintBrushFill />}
        </Button>
      </Tooltip>
    </div>
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
              <CreateThemeButton />
              <div className='h-full flex flex-col gap-2 overflow-y-auto pt-0.5'>
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
                              showRestoreThemeToast({ id, name, colors });
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
              error={!name && 'Name is required'}
              wrapperClassName='col-span-2'
              label='name'
              value={name}
              onChange={setName}
            />
            {Object.entries(inputColors).map(([key, value]) => {
              const { color, isValid } = validateColor(value, inputColors);
              return (
                <ColorInput
                  key={key}
                  colorKey={key}
                  value={value}
                  computedValue={color}
                  error={!isValid && 'Invalid color'}
                  setValue={(value) => setInputColors((draft) => void (draft[key] = value))}
                  rightNode={
                    ['main', 'sub', 'text'].includes(key) &&
                    isValid &&
                    colord(color).contrast(inputColors.bg) < 2 && (
                      <Tooltip label='Poor contrast ratio' offset={14}>
                        <Button
                          className='p-0 text-main'
                          tabIndex={-1}
                          onClick={readabilityModalHandler.open}
                        >
                          <RiAlertLine />
                        </Button>
                      </Tooltip>
                    )
                  }
                />
              );
            })}
            <Text className='col-span-full text-sm' dimmed>
              tip: you can use css variables to reference other colors (e.g.{' '}
              <code className='rounded bg-sub-alt px-1 py-0.5 font-default transition-colors'>
                var(--bg-color)
              </code>
              )
            </Text>
            <div className='col-span-full mt-2 flex gap-2'>
              <Button
                className='w-full'
                variant='danger'
                onClick={() => {
                  if (customTheme) {
                    showRestoreThemeToast(customTheme);
                    deleteTheme(customThemeId);
                  }
                }}
              >
                delete
              </Button>
              <Button onClick={duplicateTheme} {...COMMON_BUTTON_PROPS}>
                duplicate
              </Button>
              <Button onClick={shareTheme} {...COMMON_BUTTON_PROPS}>
                share
              </Button>
              <Button
                type='submit'
                disabled={
                  !name ||
                  Object.values(inputColors).some(
                    (color) => !validateColor(color, inputColors).isValid,
                  )
                }
                {...COMMON_BUTTON_PROPS}
              >
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
          <CreateThemeButton />
        </>
      )}
      <AIThemeGenerationModal
        open={themeModalOpen}
        onClose={themeModalHandler.close}
        addTheme={addTheme}
      />
      <ReadabilityModal open={readabilityModalOpen} onClose={readabilityModalHandler.close} />
    </Transition>
  );
}
