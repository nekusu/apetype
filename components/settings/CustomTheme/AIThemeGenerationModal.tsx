import Loading from '@/app/loading';
import { Button } from '@/components/core/Button';
import { Grid } from '@/components/core/Grid';
import { Group } from '@/components/core/Group';
import { Input } from '@/components/core/Input';
import { Modal, type ModalProps } from '@/components/core/Modal';
import { Text } from '@/components/core/Text';
import { Tooltip } from '@/components/core/Tooltip';
import { Transition } from '@/components/core/Transition';
import { useColorPalette } from '@/hooks/useColorPalette';
import type { CustomTheme, ThemeColors } from '@/utils/theme';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { shallowEqual, useDidUpdate, useListState } from '@mantine/hooks';
import type { Optional } from '@tanstack/react-query';
import { colord } from 'colord';
import { AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { RiLockFill, RiLockUnlockFill, RiQuestionLine } from 'react-icons/ri';
import { type InferInput, maxLength, nonEmpty, object, pipe, string, trim } from 'valibot';

export interface AIThemeGenerationModalProps extends ModalProps {
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

const ThemeSchema = object({
  name: pipe(
    string(),
    trim(),
    nonEmpty('Name is required'),
    maxLength(32, 'Name must have at most 32 characters'),
  ),
});
type ThemeInput = InferInput<typeof ThemeSchema>;

export function AIThemeGenerationModal({ addTheme, ...props }: AIThemeGenerationModalProps) {
  const { opened } = props;
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<ThemeInput>({
    defaultValues: { name: '' },
    resolver: valibotResolver(ThemeSchema),
  });
  const [model, setModel] = useState<Model>('transformer');
  const [creativity, setCreativity] = useState(1.5);
  const [lockedColors, lockedColorsHandler] = useListState<string>(DEFAULT_PALETTE);
  const { generate, palettes, isPending, lastUsedOptions } = useColorPalette();
  const [activePalette, setActivePalette] = useState(0);
  const shouldRegenerate = useMemo(
    () =>
      !shallowEqual(lockedColors, lastUsedOptions.current.palette) ||
      model !== lastUsedOptions.current.model ||
      creativity !== lastUsedOptions.current.creativity,
    [lockedColors, lastUsedOptions, lastUsedOptions.current, model, creativity],
  );

  const onSubmit: SubmitHandler<ThemeInput> = ({ name }) => {
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
    if (opened && !palettes.length) generate({ model, creativity, palette: lockedColors });
  }, [opened]);

  return (
    <Modal {...props}>
      <form className='flex max-w-sm flex-col gap-3.5' onSubmit={handleSubmit(onSubmit)}>
        <Text asChild className='text-2xl'>
          <h3>AI Theme Generation</h3>
        </Text>
        <Text className='text-sm' dimmed>
          Use machine learning to create unique color schemes!
        </Text>
        <div className='flex flex-col gap-3'>
          <Input error={errors.name?.message} label='name' data-autofocus {...register('name')} />
          <Grid className='grid-cols-3'>
            <div className='-mb-1 col-span-full flex gap-1 text-sm text-sub leading-none'>
              model
            </div>
            {(Object.keys(MODELS) as Model[]).map((m) => (
              <Tooltip key={m} className='max-w-xs text-xs' label={MODELS[m]}>
                <Button active={model === m} onClick={() => setModel(m)}>
                  {m}
                </Button>
              </Tooltip>
            ))}
          </Grid>
          <Grid className='grid-cols-3'>
            <div className='-mb-1 col-span-full flex gap-1 text-sm text-sub leading-none'>
              creativity
              <Tooltip
                className='max-w-xs text-xs'
                label={
                  <>
                    Higher creativity will result in more random and potentially creative results.
                    Low creativity will result in more "average" or typical colors.
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
                onClick={() => setCreativity(CREATIVITY[c])}
              >
                {c}
              </Button>
            ))}
          </Grid>
        </div>
        <AnimatePresence mode='wait'>
          {palettes.length ? (
            <Transition key='colors' className='my-1 grid grid-cols-2 gap-2'>
              {palettes[activePalette]?.map((color, i) => {
                const palette = palettes[activePalette];
                const highestContrastColor = palette.reduce((highest, _color) => {
                  const colorContrast = colord(color).contrast(_color);
                  return colorContrast > colord(color).contrast(highest) ? _color : highest;
                });
                const isColorLocked = lockedColors.includes(color);

                return (
                  <Group key={LABELS[i]} grow={false}>
                    <Button
                      className='group hover:-translate-y-0.5 w-full justify-start text-sm hover:shadow-lg active:translate-y-0.5 active:transform-none'
                      style={{ backgroundColor: color, color: highestContrastColor }}
                      onClick={() =>
                        navigator.clipboard
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
                        onClick={() => {
                          if (isColorLocked) lockedColorsHandler.setItem(i, '-');
                          else lockedColorsHandler.setItem(i, color);
                        }}
                      >
                        {isColorLocked ? <RiLockFill /> : <RiLockUnlockFill />}
                      </Button>
                    </Tooltip>
                  </Group>
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
        <Group>
          <Button disabled={activePalette <= 0} onClick={() => setActivePalette((i) => i - 1)}>
            previous
          </Button>
          <Button
            disabled={!palettes.length}
            loading={!!palettes.length && isPending}
            onClick={() => {
              const options = { model, creativity, palette: lockedColors };
              if (shouldRegenerate) {
                generate(options);
                setActivePalette(0);
              } else if (activePalette >= palettes.length - 1)
                generate(options).then(() => setActivePalette((i) => i + 1));
              else setActivePalette((i) => i + 1);
            }}
          >
            {shouldRegenerate ? 'generate' : 'next'}
          </Button>
        </Group>
        <Text className='text-sm' dimmed>
          Powered by{' '}
          <a
            className='text-main hover:underline'
            href='https://huemint.com'
            target='_blank'
            rel='noreferrer'
          >
            Huemint
          </a>
          .
        </Text>
        <Button disabled={!palettes.length} type='submit'>
          save
        </Button>
      </form>
    </Modal>
  );
}
