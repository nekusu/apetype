'use client';

import { valibotResolver } from '@hookform/resolvers/valibot';
import { useDidUpdate } from '@mantine/hooks';
import Loading from 'app/loading';
import { Button, Divider, Input, Modal, Text, Tooltip, Transition } from 'components/core';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Area } from 'react-easy-crop';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import {
  RiClipboardLine,
  RiCloseLine,
  RiImageFill,
  RiLoaderLine,
  RiUpload2Fill,
} from 'react-icons/ri';
import { twJoin } from 'tailwind-merge';
import { Input as ValiInput, object, optional, string, toTrimmed, url } from 'valibot';

const Cropper = dynamic(() => import('react-easy-crop'), {
  loading: () => <Loading transition={{ duration: 0.15 }} style={{ height: 448 }} />,
  ssr: false,
});

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  aspect?: number;
  enableShapeSelection?: boolean;
  initialShape?: 'rect' | 'round';
  targetWidth?: number;
  targetHeight?: number;
  onDelete?: () => Promise<void>;
  onSave?: (imageBlob: Blob | null, shape?: 'rect' | 'round') => Promise<void>;
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.setAttribute('crossorigin', 'anonymous');
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', (error) => reject(error));
    img.src = url;
  });
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

  let finalCanvas = croppedCanvas;
  const resizedCanvas = document.createElement('canvas');
  const resizedCtx = resizedCanvas.getContext('2d');

  if (!resizedCtx) return null;

  if (
    targetWidth &&
    targetHeight &&
    pixelCrop.width > targetWidth &&
    pixelCrop.height > targetHeight
  ) {
    resizedCanvas.width = targetWidth;
    resizedCanvas.height = targetHeight;
    resizedCtx.drawImage(
      croppedCanvas,
      0,
      0,
      croppedCanvas.width,
      croppedCanvas.height,
      0,
      0,
      targetWidth,
      targetHeight,
    );
    finalCanvas = resizedCanvas;
  }

  return new Promise((resolve) => {
    finalCanvas.toBlob((file) => {
      if (file) resolve(file);
    }, 'image/png');
  });
}

const imageSchema = object({ imageURL: optional(string([toTrimmed(), url()])) });
type ImageForm = ValiInput<typeof imageSchema>;

export default function SetImageModal({
  open,
  onClose,
  title,
  aspect = 1,
  enableShapeSelection,
  initialShape = 'rect',
  targetWidth,
  targetHeight,
  onDelete,
  onSave,
}: ModalProps) {
  const {
    formState: { isValid, errors },
    register,
    reset,
    setFocus,
    setError,
    setValue,
    watch,
  } = useForm<ImageForm>({
    defaultValues: { imageURL: '' },
    mode: 'onChange',
    resolver: valibotResolver(imageSchema),
  });
  const imageURLValue = watch('imageURL');
  const [imageURL, setImageURL] = useState<string | null>(null);
  const [shape, setShape] = useState<'rect' | 'round'>(initialShape);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isValidatingImage, setIsValidatingImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFile = (file?: File | null) => {
    if (!file) return;
    if (!file.type.includes('image')) toast.error('Invalid file type.');
    else {
      const reader = new FileReader();
      reader.addEventListener('load', () => setImageURL(reader.result as string), false);
      reader.readAsDataURL(file);
    }
  };
  const deleteImage = async () => {
    try {
      onClose();
      await onDelete?.();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };
  const saveImage = async () => {
    try {
      setIsLoading(true);
      const croppedImage =
        imageURL && croppedAreaPixels
          ? await getCroppedImage(imageURL, croppedAreaPixels, targetWidth, targetHeight)
          : null;
      await onSave?.(croppedImage, enableShapeSelection ? shape : undefined);
      onClose();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useDidUpdate(() => {
    if (open) reset();
  }, [open]);
  useDidUpdate(() => {
    setShape(initialShape);
  }, [initialShape]);
  useDidUpdate(() => {
    if (imageURLValue && isValid) {
      void (async () => {
        try {
          setIsValidatingImage(true);
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
      open={open}
      onClose={onClose}
      centered
      layout
      transition={{ type: 'spring', bounce: 0.6, layout: { type: 'spring', duration: 0.25 } }}
      style={{ borderRadius: 12 }}
      onAnimationComplete={(definition) => definition === 'hidden' && setImageURL(null)}
    >
      <div
        className={twJoin([
          'min-w-[300px] flex flex-col gap-3.5 transition',
          isLoading && '!pointer-events-none !opacity-60',
        ])}
      >
        <Text asChild className='text-2xl'>
          <h3>{title}</h3>
        </Text>
        {!imageURL ? (
          <div className='flex flex-col gap-2'>
            <Input
              error={errors.imageURL?.message}
              placeholder='paste image or url'
              leftNode={<RiImageFill />}
              rightNode={
                isValidatingImage ? (
                  <RiLoaderLine className='animate-spin' />
                ) : (
                  <Tooltip label={imageURLValue ? 'Clear' : 'Paste from clipboard'}>
                    <Button
                      className='p-0'
                      onMouseDown={() => {
                        void (async () => {
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
                        })();
                      }}
                    >
                      {imageURLValue ? <RiCloseLine /> : <RiClipboardLine />}
                    </Button>
                  </Tooltip>
                )
              }
              onPaste={(e) => handleFile(e.clipboardData.files[0])}
              {...register('imageURL')}
            />
            <Divider label='or' />
            <Button asChild className='w-full' variant='filled'>
              <label tabIndex={0}>
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
        ) : (
          <div className='aspect-square max-w-[calc(100vw-7rem)] w-md'>
            <Transition
              className='relative h-full w-full overflow-hidden rounded-lg'
              variants={{
                hidden: { display: 'none', opacity: 0 },
                visible: { display: 'block', opacity: 1, transition: { delay: 0.25 } },
              }}
            >
              <Cropper
                classes={{
                  containerClassName: 'bg-sub-alt',
                  cropAreaClassName: '!border-4 !border-main rounded-xl transition-border-radius',
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
        )}
        {(enableShapeSelection || imageURL || onDelete) && (
          <>
            {enableShapeSelection && (
              <div className='grid grid-rows-[auto_auto_auto] grid-cols-2 gap-x-2 gap-y-1'>
                <Text className='col-span-full' dimmed>
                  image shape
                </Text>
                {(['rect', 'round'] as const).map((s) => (
                  <Button
                    key={s}
                    active={s === shape}
                    className='w-full'
                    variant='filled'
                    onClick={() => setShape(s)}
                  >
                    {s === 'rect' ? 'square' : s}
                  </Button>
                ))}
              </div>
            )}
            <div className='flex gap-2'>
              {imageURL ? (
                <Button
                  className='w-full'
                  variant='filled'
                  onClick={() => {
                    reset();
                    setImageURL(null);
                  }}
                >
                  back
                </Button>
              ) : (
                onDelete && (
                  <Button className='w-full' variant='danger' onClick={() => void deleteImage()}>
                    delete
                  </Button>
                )
              )}
              <Button
                active
                disabled={shape === initialShape && !imageURL}
                className='h-9 w-full'
                variant='filled'
                onClick={() => void saveImage()}
              >
                {isLoading ? <RiLoaderLine className='animate-spin' /> : 'save'}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
