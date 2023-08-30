'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useDidUpdate, useDisclosure, useToggle } from '@mantine/hooks';
import { colord, extend } from 'colord';
import a11yPlugin from 'colord/plugins/a11y';
import { Button, Input, Text, Tooltip, Transition } from 'components/core';
import { ButtonProps } from 'components/core/Button';
import { ThemeButton } from 'components/settings';
import { useSettings } from 'context/settingsContext';
import { useTheme } from 'context/themeContext';
import { AnimatePresence, HTMLMotionProps } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { RiAlertLine, RiDeleteBin7Line, RiPaintBrushFill, RiSparklingFill } from 'react-icons/ri';
import { twMerge } from 'tailwind-merge';
import { CustomTheme, validateColor } from 'utils/theme';
import { z } from 'zod';
import AIThemeGenerationModal from './AIThemeGenerationModal';
import ColorInput from './ColorInput';
import ReadabilityModal from './ReadabilityModal';

extend([a11yPlugin]);

const COMMON_BUTTON_PROPS: Omit<ButtonProps, 'ref'> = { className: 'w-full', variant: 'filled' };
const zColor = (color: string) =>
  z
    .string()
    .trim()
    .min(1, `${color} color is required`)
    .refine((color) => validateColor(color).isValid, 'Invalid color');
const formSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(30, 'Name must have at most 30 characters'),
  colors: z.object({
    bg: zColor('Background'),
    main: zColor('Main'),
    caret: zColor('Caret'),
    sub: zColor('Sub'),
    subAlt: zColor('Sub alt'),
    text: zColor('Text'),
    error: zColor('Error'),
    errorExtra: zColor('Error extra'),
    colorfulError: zColor('Colorful error'),
    colorfulErrorExtra: zColor('Colorful error extra'),
  }),
});
type FormValues = z.infer<typeof formSchema>;

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
  } = useForm<FormValues>({
    defaultValues: { name: '', colors: {} },
    mode: 'onChange',
    resolver: zodResolver(formSchema),
  });
  const colors = watch('colors');
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
    const { name, colors } = customTheme;
    addTheme({ name, colors });
  };
  const shareTheme = () => {
    const encodedTheme = Buffer.from(JSON.stringify(customTheme)).toString('base64');
    void navigator.clipboard
      .writeText(`${window.location.origin}?customTheme=${encodedTheme}`)
      .then(() => toast.success('URL copied to clipboard!'));
  };
  const onSubmit: SubmitHandler<FormValues> = ({ name, colors }) => {
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
    <div className='flex gap-2'>
      <Button
        className='col-span-full w-full px-3'
        variant='filled'
        onClick={() => {
          if (themeCreation === 'AI') themeModalHandler.open();
          else if (themeColors.preset) addTheme({ name: theme, colors: themeColors.preset });
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
      setValue('name', customTheme.name);
      setValue('colors', customTheme.colors);
      clearErrors();
    }
  }, [clearErrors, customTheme, setValue]);

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
            onSubmit={(e) => void handleSubmit(onSubmit)(e)}
          >
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
