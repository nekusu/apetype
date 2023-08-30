'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { shallowEqual, useDidUpdate, useListState } from '@mantine/hooks';
import Loading from 'app/loading';
import { colord } from 'colord';
import { Button, Input, Modal, Text, Tooltip, Transition } from 'components/core';
import { AnimatePresence } from 'framer-motion';
import { useColorPalette } from 'hooks/useColorPalette';
import { useMemo, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { RiLoaderLine, RiLockFill, RiLockUnlockFill, RiQuestionLine } from 'react-icons/ri';
import { CustomTheme, ThemeColors } from 'utils/theme';
import { z } from 'zod';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  addTheme: (theme: Optional<CustomTheme, 'id'>) => void;
}
type Model = 'transformer' | 'diffusion' | 'random';
type Creativity = 'low' | 'medium' | 'high';

const MODELS: Record<Model, JSX.Element> = {
  transformer: (
    <>
      The transformer model is a machine learning model that has been widely applied in natural
      language processing (NLP). It uses a quantized codebook to encode input data and generates
      output tokens in an auto-regressive fashion, allowing for diverse and customizable results.
    </>
  ),
  diffusion: (
    <>
      The diffusion model is a type of generative model that uses a denoising diffusion
      probabilistic model to generate images by iteratively adding noise to an image until it
      matches the desired contrast.
    </>
  ),
  random: (
    <>
      The random model is a non-machine learning algorithm that generates color palettes completely
      at random, sampling each color from a distribution of colors typically chosen by graphic
      designers, and returning the top 1% of palettes that come closest to the desired contrast.
    </>
  ),
};
const CREATIVITY: Record<Creativity, number> = { low: 1, medium: 1.5, high: 2 };
const DEFAULT_PALETTE = Array(6).fill('-') as string[];
const LABELS = ['background', 'main', 'sub', 'sub alt', 'text', 'error'] as const;

const formSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(30, 'Name must have at most 30 characters'),
});
type FormValues = z.infer<typeof formSchema>;

export default function AIThemeGenerationModal({ open, onClose, addTheme }: ModalProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<FormValues>({
    defaultValues: { name: '' },
    resolver: zodResolver(formSchema),
  });
  const [model, setModel] = useState<Model>('transformer');
  const [creativity, setCreativity] = useState(1.5);
  const [lockedColors, lockedColorsHandler] = useListState<string>(DEFAULT_PALETTE);
  const { generate, palettes, isLoading, lastUsedOptions } = useColorPalette();
  const [activePalette, setActivePalette] = useState(0);
  const shouldRegenerate = useMemo(
    () =>
      !shallowEqual(lockedColors, lastUsedOptions.current.palette) ||
      model !== lastUsedOptions.current.model ||
      creativity !== lastUsedOptions.current.creativity,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lockedColors, lastUsedOptions, lastUsedOptions.current, model, creativity],
  );

  const onSubmit: SubmitHandler<FormValues> = ({ name }) => {
    const palette = palettes[activePalette];
    const errorColor = colord(palette[5]);
    const colors: ThemeColors = {
      bg: palette[0],
      main: palette[1],
      caret: 'var(--main-color)',
      sub: palette[2],
      subAlt: palette[3],
      text: palette[4],
      error: palette[5],
      errorExtra: (errorColor.isDark() ? errorColor.lighten(0.2) : errorColor.darken(0.2)).toHex(),
      colorfulError: 'var(--error-color)',
      colorfulErrorExtra: 'var(--error-extra-color)',
    };
    addTheme({ name, colors });
  };

  useDidUpdate(() => {
    if (open && !palettes.length) void generate({ model, creativity, palette: lockedColors });
  }, [open]);

  return (
    <Modal centered open={open} onClose={onClose}>
      <form
        className='max-w-sm flex flex-col gap-3.5 text-sm'
        onSubmit={(e) => void handleSubmit(onSubmit)(e)}
      >
        <Text asChild className='text-2xl'>
          <h3>AI Theme Generation</h3>
        </Text>
        <Text className='text-[length:inherit]' dimmed>
          Use machine learning to create unique color schemes!
        </Text>
        <div className='flex flex-col gap-3'>
          <Input error={errors.name?.message} label='name' data-autofocus {...register('name')} />
          <div className='grid grid-cols-3 gap-2'>
            <div className='col-span-full flex gap-1 text-sm leading-none text-sub -mb-1'>
              model
            </div>
            {(Object.keys(MODELS) as Model[]).map((m) => (
              <Tooltip key={m} className='max-w-xs text-xs' label={MODELS[m]}>
                <Button
                  active={model === m}
                  className='w-full'
                  variant='filled'
                  onClick={() => setModel(m)}
                >
                  {m}
                </Button>
              </Tooltip>
            ))}
          </div>
          <div className='grid grid-cols-3 gap-2'>
            <div className='col-span-full flex gap-1 text-sm leading-none text-sub -mb-1'>
              creativity
              <Tooltip
                className='max-w-xs text-xs'
                label={
                  <>
                    Higher creativity will result in more random and potentially creative results.
                    Low creativity will result in more &quot;average&quot; or typical colors.
                  </>
                }
              >
                <div className='cursor-help'>
                  <RiQuestionLine />
                </div>
              </Tooltip>
            </div>
            {(Object.keys(CREATIVITY) as Creativity[]).map((c) => (
              <Button
                key={c}
                active={creativity === CREATIVITY[c]}
                className='w-full'
                variant='filled'
                onClick={() => setCreativity(CREATIVITY[c])}
              >
                {c}
              </Button>
            ))}
          </div>
        </div>
        <AnimatePresence mode='wait'>
          {palettes.length ? (
            <Transition key='colors' className='grid grid-cols-2 my-1 gap-2'>
              {palettes[activePalette]?.map((color, i) => {
                const palette = palettes[activePalette];
                const highestContrastColor = palette.reduce((highest, _color) => {
                  const colorContrast = colord(color).contrast(_color);
                  return colorContrast > colord(color).contrast(highest) ? _color : highest;
                });
                const isColorLocked = lockedColors.includes(color);

                return (
                  <div key={i} className='flex gap-2'>
                    <Button
                      className='group w-full justify-start px-3 text-sm active:translate-y-0.5 active:transform-none hover:shadow-lg hover:-translate-y-0.5'
                      style={{ backgroundColor: color, color: highestContrastColor }}
                      variant='filled'
                      onClick={() =>
                        void navigator.clipboard
                          .writeText(color)
                          .then(() => toast.success('Color copied to clipboard!'))
                      }
                    >
                      <span className='block group-hover:hidden'>{LABELS[i]}</span>
                      <span className='hidden group-hover:block'>{color}</span>
                    </Button>
                    <Tooltip label={isColorLocked ? 'Unlock color' : 'Lock color'}>
                      <Button
                        active={isColorLocked}
                        className='px-2.5'
                        variant='filled'
                        onClick={() => {
                          if (isColorLocked) lockedColorsHandler.setItem(i, '-');
                          else lockedColorsHandler.setItem(i, color);
                        }}
                      >
                        {isColorLocked ? <RiLockFill /> : <RiLockUnlockFill />}
                      </Button>
                    </Tooltip>
                  </div>
                );
              })}
            </Transition>
          ) : (
            <Loading
              transition={{ duration: 0.15 }}
              style={{ height: 132 }}
              logoIconProps={{ width: '60' }}
            />
          )}
        </AnimatePresence>
        <div className='flex gap-2'>
          <Button
            className='w-full'
            disabled={activePalette <= 0}
            variant='filled'
            onClick={() => setActivePalette((i) => i - 1)}
          >
            previous
          </Button>
          <Button
            className='w-full'
            disabled={!palettes.length || isLoading}
            variant='filled'
            onClick={() => {
              const options = { model, creativity, palette: lockedColors };
              if (shouldRegenerate) {
                void generate(options);
                setActivePalette(0);
              } else if (activePalette >= palettes.length - 1)
                void generate(options).then(() => setActivePalette((i) => i + 1));
              else setActivePalette((i) => i + 1);
            }}
          >
            {!!palettes.length && isLoading ? (
              <RiLoaderLine className='animate-spin' />
            ) : shouldRegenerate ? (
              'generate'
            ) : (
              'next'
            )}
          </Button>
        </div>
        <Text className='text-[length:inherit]' dimmed>
          Powered by{' '}
          <a className='text-main hover:underline' href='https://huemint.com' target='_blank'>
            Huemint
          </a>
          .
        </Text>
        <div className='flex gap-2'>
          <Button className='w-full' disabled={!palettes.length} variant='filled' type='submit'>
            save
          </Button>
        </div>
      </form>
    </Modal>
  );
}
