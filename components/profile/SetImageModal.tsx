'use client';

import Loading from '@/app/loading';
import { Button } from '@/components/core/Button';
import { Divider } from '@/components/core/Divider';
import { Grid } from '@/components/core/Grid';
import { Group } from '@/components/core/Group';
import { Input } from '@/components/core/Input';
import { Modal, type ModalProps } from '@/components/core/Modal';
import { Text } from '@/components/core/Text';
import { Tooltip } from '@/components/core/Tooltip';
import { Transition } from '@/components/core/Transition';
import type { Enums } from '@/utils/supabase/database';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { useDidUpdate } from '@mantine/hooks';
import Compressor from 'compressorjs';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import type { Area } from 'react-easy-crop';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import {
  RiClipboardLine,
  RiCloseLine,
  RiImageFill,
  RiLoaderLine,
  RiUpload2Fill,
} from 'react-icons/ri';
import { url, type InferInput, object, optional, pipe, string, trim } from 'valibot';

const Cropper = dynamic(() => import('react-easy-crop'), {
  loading: () => <Loading transition={{ duration: 0.15 }} style={{ height: 448 }} />,
  ssr: false,
});

export interface SetImageModalProps extends ModalProps {
  title: string;
  aspect?: number;
  enableShapeSelection?: boolean;
  initialShape?: 'rect' | 'round';
  targetWidth?: number;
  targetHeight?: number;
  onDelete?: () => Promise<void>;
  onSave?: (imageBlob: Blob | null, shape: Enums<'avatarShape'>) => Promise<void>;
}

async function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.setAttribute('crossorigin', 'anonymous');
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', (error) => reject(error));
    img.src = url;
  });
}
async function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob((file) => resolve(file), 'image/png'));
}
async function compress(file: Blob, options?: Compressor.Options): Promise<Blob | null> {
  return await new Promise(
    (resolve, reject) => new Compressor(file, { ...options, success: resolve, error: reject }),
  );
}
async function getCroppedImage(
  imageSrc: string,
  pixelCrop: Area,
  targetWidth?: number,
  targetHeight?: number,
): Promise<Blob | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  canvas.width = image.width;
  canvas.height = image.height;
  ctx.translate(image.width / 2, image.height / 2);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement('canvas');
  const croppedCtx = croppedCanvas.getContext('2d');
  if (!croppedCtx) return null;

  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;
  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  const blob = await canvasToBlob(croppedCanvas);
  if (!blob) return null;

  return await compress(blob, {
    quality: 0.8,
    height: Math.min(pixelCrop.height, targetHeight ?? pixelCrop.height),
    width: Math.min(pixelCrop.width, targetWidth ?? pixelCrop.width),
    mimeType: 'image/webp',
  });
}

const ImageSchema = object({ imageURL: optional(pipe(string(), trim(), url())) });
type ImageInput = InferInput<typeof ImageSchema>;

export function SetImageModal({
  title,
  aspect = 1,
  enableShapeSelection,
  initialShape = 'rect',
  targetWidth,
  targetHeight,
  onDelete,
  onSave,
  ...props
}: SetImageModalProps) {
  const { opened, onClose } = props;
  const {
    formState: { isValid, errors },
    register,
    reset,
    setFocus,
    setError,
    setValue,
    watch,
  } = useForm<ImageInput>({
    defaultValues: { imageURL: '' },
    mode: 'onChange',
    resolver: valibotResolver(ImageSchema),
  });
  const imageURLValue = watch('imageURL');
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [shape, setShape] = useState<'rect' | 'round'>(initialShape);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isValidatingImage, setIsValidatingImage] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFile = (file?: File | null) => {
    if (!file) return;
    if (file.type.includes('image')) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setImageURL(reader.result as string), false);
      reader.readAsDataURL(file);
    } else toast.error('Invalid file type.');
  };
  const pasteFromClipboard = async () => {
    if (imageURLValue) {
      reset();
      return;
    }
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find((type) => type.includes('image'));
        if (imageType) {
          const blob = await item.getType(imageType);
          const file = new File([blob], 'image.png', { type: imageType });
          handleFile(file);
        } else if (item.types.includes('text/plain')) {
          const blob = await item.getType('text/plain');
          const value = await blob.text();
          setValue('imageURL', value, { shouldValidate: true });
        }
      }
    } catch (e) {
      toast.error(`Failed to read clipboard! ${(e as Error).message}`);
    }
  };
  const deleteImage = async () => {
    setIsDeleting(true);
    try {
      await onDelete?.();
      onClose?.();
    } catch (e) {
      toast.error(`Failed to delete image! ${(e as Error).message}`);
    } finally {
      setIsDeleting(false);
    }
  };
  const saveImage = async () => {
    try {
      setIsLoading(true);
      const croppedImage =
        imageURL && croppedAreaPixels
          ? await getCroppedImage(imageURL, croppedAreaPixels, targetWidth, targetHeight)
          : null;
      await onSave?.(croppedImage, enableShapeSelection ? shape : initialShape);
      onClose?.();
    } catch (e) {
      toast.error(`Failed to upload image! ${(e as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useDidUpdate(() => {
    if (opened) {
      reset();
      setShape(initialShape);
    }
  }, [opened]);
  useDidUpdate(() => {
    setShape(initialShape);
  }, [initialShape]);
  useDidUpdate(() => {
    if (imageURLValue && isValid) {
      (async () => {
        setIsValidatingImage(true);
        try {
          await createImage(imageURLValue);
          setImageURL(imageURLValue);
        } catch {
          setError('imageURL', { message: 'URL does not link to an image' });
        } finally {
          setIsValidatingImage(false);
        }
      })();
    }
  }, [imageURLValue, isValid]);
  useDidUpdate(() => {
    if (!imageURL) setFocus('imageURL');
  }, [imageURL]);

  return (
    <Modal
      layout
      transition={{ type: 'spring', bounce: 0.6, layout: { type: 'spring', duration: 0.25 } }}
      style={{ borderRadius: 12 }}
      onAnimationComplete={(definition) => definition === 'hidden' && setImageURL(null)}
      {...props}
    >
      <div className='flex min-w-[300px] flex-col gap-3.5 transition'>
        <Text asChild className='text-2xl'>
          <h3>{title}</h3>
        </Text>
        {imageURL ? (
          <div className='aspect-square w-md max-w-[calc(100vw-7rem)]'>
            <Transition
              className='relative h-full w-full overflow-hidden rounded-xl'
              variants={{
                hidden: { display: 'none', opacity: 0 },
                visible: { display: 'block', opacity: 1, transition: { delay: 0.2 } },
              }}
            >
              <Cropper
                classes={{
                  containerClassName: 'bg-sub-alt',
                  cropAreaClassName: '!border-4 !border-main rounded-xl transition-all',
                }}
                image={imageURL}
                cropShape={shape}
                crop={crop}
                zoom={zoom}
                zoomSpeed={0.25}
                aspect={aspect}
                showGrid={false}
                rotation={0}
                minZoom={1}
                maxZoom={3}
                restrictPosition
                style={{}}
                mediaProps={{}}
                onCropChange={setCrop}
                onCropComplete={(_: Area, croppedAreaPixels: Area) =>
                  setCroppedAreaPixels(croppedAreaPixels)
                }
                onZoomChange={setZoom}
              />
            </Transition>
          </div>
        ) : (
          <div className='flex flex-col gap-2'>
            <Input
              error={errors.imageURL?.message}
              placeholder='paste image or url'
              leftNode={
                isValidatingImage ? <RiLoaderLine className='animate-spin' /> : <RiImageFill />
              }
              rightNode={
                <Tooltip label={imageURLValue ? 'Clear' : 'Paste from clipboard'}>
                  <Button className='p-0' onClick={pasteFromClipboard} variant='text'>
                    {imageURLValue ? <RiCloseLine /> : <RiClipboardLine />}
                  </Button>
                </Tooltip>
              }
              onPaste={(e) => handleFile(e.clipboardData.files[0])}
              {...register('imageURL')}
            />
            <Divider label='or' />
            <Button asChild>
              <label>
                upload image
                <RiUpload2Fill />
                <input
                  accept='image/*'
                  className='hidden'
                  onChange={(e) => handleFile(e.target.files?.[0])}
                  type='file'
                />
              </label>
            </Button>
          </div>
        )}
        {(enableShapeSelection || imageURL || onDelete) && (
          <>
            {enableShapeSelection && (
              <Grid className='gap-y-1'>
                <Text className='col-span-full text-sm' dimmed>
                  image shape
                </Text>
                {(['rect', 'round'] as const).map((s) => (
                  <Button key={s} active={s === shape} onClick={() => setShape(s)}>
                    {s === 'rect' ? 'square' : s}
                  </Button>
                ))}
              </Grid>
            )}
            <Group>
              {imageURL ? (
                <Button
                  onClick={() => {
                    reset();
                    setImageURL(null);
                  }}
                >
                  back
                </Button>
              ) : (
                onDelete && (
                  <Button
                    disabled={isLoading}
                    loading={isDeleting}
                    onClick={deleteImage}
                    variant='danger'
                  >
                    delete
                  </Button>
                )
              )}
              <Button
                active
                disabled={isDeleting || (shape === initialShape && !imageURL)}
                loading={isLoading}
                onClick={saveImage}
              >
                save
              </Button>
            </Group>
          </>
        )}
      </div>
    </Modal>
  );
}
