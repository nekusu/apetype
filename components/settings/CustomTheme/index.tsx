'use client';

import { Button, Grid, Group, Input, Text, Tooltip, Transition } from '@/components/core';
import { ThemeButton } from '@/components/settings';
import { useSettings } from '@/context/settingsContext';
import { useTheme } from '@/context/themeContext';
import { type CustomTheme, validateColor } from '@/utils/theme';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { useDidUpdate, useDisclosure, useToggle } from '@mantine/hooks';
import { colord, extend } from 'colord';
import a11yPlugin from 'colord/plugins/a11y';
import { AnimatePresence, type HTMLMotionProps } from 'framer-motion';
import { nanoid } from 'nanoid/non-secure';
import { useEffect, useRef } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { RiAlertLine, RiDeleteBin7Line, RiPaintBrushFill, RiSparklingFill } from 'react-icons/ri';
import { twMerge } from 'tailwind-merge';
import {
  type Input as ValiInput,
  custom,
  maxLength,
  minLength,
  object,
  string,
  toTrimmed,
} from 'valibot';
import AIThemeGenerationModal from './AIThemeGenerationModal';
import ColorInput from './ColorInput';
import ReadabilityModal from './ReadabilityModal';

extend([a11yPlugin]);

const color = (color: string) =>
  string([
    toTrimmed(),
    minLength(1, `${color} color is required`),
    custom((color) => validateColor(color).isValid, 'Invalid color'),
  ]);
const customThemeSchema = object({
  name: string([
    toTrimmed(),
    minLength(1, 'Name is required'),
    maxLength(32, 'Name must have at most 32 characters'),
  ]),
  colors: object({
    bg: color('Background'),
    main: color('Main'),
    caret: color('Caret'),
    sub: color('Sub'),
    subAlt: color('Sub alt'),
    text: color('Text'),
    error: color('Error'),
    errorExtra: color('Error extra'),
    colorfulError: color('Colorful error'),
    colorfulErrorExtra: color('Colorful error extra'),
  }),
});
type CustomThemeForm = ValiInput<typeof customThemeSchema>;

export default function CustomTheme({ className, ...props }: HTMLMotionProps<'div'>) {
  const { theme, customThemes, customTheme: customThemeId, setSettings } = useSettings();
  const { colors: themeColors } = useTheme();
  const [themeCreation, toggleThemeCreation] = useToggle(['AI', 'preset']);
  const {
    clearErrors,
    formState: { errors },
    handleSubmit,
    register,
    setValue,
    watch,
  } = useForm<CustomThemeForm>({
    defaultValues: { name: '', colors: {} },
    mode: 'onChange',
    resolver: valibotResolver(customThemeSchema),
  });
  const colors = watch('colors');
  const [themeModalOpened, themeModalHandler] = useDisclosure(false);
  const [readabilityModalOpened, readabilityModalHandler] = useDisclosure(false);
  const themeButtonRef = useRef<HTMLButtonElement>(null);
  const customTheme = customThemes.find(({ id }) => id === customThemeId);

  const addTheme = (theme: Optional<CustomTheme, 'id'>) => {
    const id = theme.id ?? nanoid(28);
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
          <Text className='leading-tight'>Custom theme '{theme.name}' deleted!</Text>
          <Group>
            <Button variant='subtle' onClick={() => toast.dismiss(t.id)}>
              dismiss
            </Button>
            <Button active onClick={() => addTheme(theme)}>
              restore theme
            </Button>
          </Group>
        </div>
      ),
      { duration: 8000 },
    );
  };
  const duplicateTheme = () => {
    if (!customTheme) return;
    const { name, colors } = customTheme;
    addTheme({ name, colors });
  };
  const shareTheme = () => {
    const encodedTheme = Buffer.from(JSON.stringify(customTheme)).toString('base64');
    navigator.clipboard
      .writeText(`${window.location.origin}?customTheme=${encodedTheme}`)
      .then(() => toast.success('URL copied to clipboard!'));
  };
  const onSubmit: SubmitHandler<CustomThemeForm> = ({ name, colors }) => {
    setSettings((draft) => {
      const index = draft.customThemes.findIndex(({ id }) => id === draft.customTheme);
      if (index >= 0) {
        draft.customThemes[index].name = name;
        draft.customThemes[index].colors = colors;
        draft.customThemes.sort((a, b) => a.name.localeCompare(b.name));
      }
    });
    toast.success('Theme saved successfully!');
  };

  const CreateThemeButton = () => (
    <Group grow={false}>
      <Button
        className='grow-1'
        onClick={() => {
          if (themeCreation === 'AI') themeModalHandler.open();
          else if (themeColors.preset) addTheme({ name: theme, colors: themeColors.preset });
        }}
      >
        create theme
      </Button>
      <Tooltip label={themeCreation === 'AI' ? 'Generate with AI' : 'Load from preset'}>
        <Button active className='px-2.5' onClick={() => toggleThemeCreation()}>
          {themeCreation === 'AI' ? <RiSparklingFill /> : <RiPaintBrushFill />}
        </Button>
      </Tooltip>
    </Group>
  );

  useDidUpdate(() => {
    themeButtonRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [customTheme]);
  useEffect(() => {
    if (customTheme) {
      setValue('name', customTheme.name);
      setValue('colors', customTheme.colors);
      clearErrors();
    }
  }, [clearErrors, customTheme, setValue]);

  return (
    <Transition
      className={twMerge(
        customThemes.length ? 'grid grid-cols-[1fr_3fr] gap-5' : 'flex flex-col items-center gap-3',
        className,
      )}
      {...props}
    >
      {customThemes.length ? (
        <>
          <div className='relative'>
            <div className='absolute inset-0 flex flex-col gap-4'>
              <CreateThemeButton />
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
                              showRestoreThemeToast({ id, name, colors });
                              deleteTheme(id);
                            }}
                          />
                        }
                        name={name}
                        selected={id === customThemeId}
                        onClick={() =>
                          setSettings((draft) => {
                            draft.customTheme = id;
                          })
                        }
                        colors={colors}
                      />
                    </Transition>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
          <Grid asChild className='grid-cols-4 gap-y-3'>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Input
                error={errors.name?.message}
                wrapperClassName='col-span-2'
                label='name'
                {...register('name')}
              />
              {Object.entries(colors).map(([k, value]) => {
                const key = k as keyof typeof colors;
                const { color, isValid } = validateColor(value, colors);
                return (
                  <ColorInput
                    key={key}
                    colorKey={key}
                    computedValue={color}
                    error={errors.colors?.[key]?.message}
                    setValue={(value) => setValue(`colors.${key}`, value)}
                    rightNode={
                      ['main', 'sub', 'text'].includes(key) &&
                      isValid &&
                      colord(color).contrast(colors.bg) < 2 && (
                        <Tooltip label='Poor contrast ratio' offset={14}>
                          <Button
                            className='ml-1.5 p-0 text-main'
                            tabIndex={-1}
                            onClick={readabilityModalHandler.open}
                            variant='text'
                          >
                            <RiAlertLine />
                          </Button>
                        </Tooltip>
                      )
                    }
                    {...register(`colors.${key}`)}
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
              <Group className='col-span-full mt-2'>
                <Button
                  variant='danger'
                  onClick={() => {
                    if (customTheme) {
                      showRestoreThemeToast(customTheme);
                      deleteTheme(customTheme.id);
                    }
                  }}
                >
                  delete
                </Button>
                <Button onClick={duplicateTheme}>duplicate</Button>
                <Button onClick={shareTheme}>share</Button>
                <Button type='submit'>save</Button>
              </Group>
            </form>
          </Grid>
        </>
      ) : (
        <>
          <Text className='text-center' dimmed>
            Looks like you don't have any custom theme yet.
          </Text>
          <CreateThemeButton />
        </>
      )}
      <AIThemeGenerationModal
        opened={themeModalOpened}
        onClose={themeModalHandler.close}
        addTheme={addTheme}
      />
      <ReadabilityModal opened={readabilityModalOpened} onClose={readabilityModalHandler.close} />
    </Transition>
  );
}
