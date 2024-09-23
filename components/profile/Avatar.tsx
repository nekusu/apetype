'use client';

import { LazyImage, type LazyImageProps } from '@/components/core/LazyImage';
import { Modal } from '@/components/core/Modal';
import type { Enums } from '@/utils/supabase/database';
import { useDisclosure } from '@mantine/hooks';
import type { Optional } from '@tanstack/react-query';
import type { ComponentPropsWithoutRef } from 'react';
import { RiGhostLine } from 'react-icons/ri';
import { twMerge } from 'tailwind-merge';

export interface AvatarProps extends ComponentPropsWithoutRef<'div'> {
  expandable?: boolean;
  imageProps: Optional<LazyImageProps, 'alt'>;
  shape?: Enums<'avatarShape'>;
}

export function Avatar({
  className,
  expandable = true,
  imageProps: { alt = 'Avatar', src, ...imageProps },
  shape = 'rect',
  ...props
}: AvatarProps) {
  const { height, width } = imageProps;
  const [imageModalOpened, imageModalHandler] = useDisclosure(false);

  return (
    <>
      <div
        className={twMerge(
          'relative box-content overflow-hidden border-4 border-sub-alt bg-bg transition-all',
          src ? 'cursor-pointer active:scale-[.925]' : 'flex items-center justify-center',
          shape === 'rect' ? 'rounded-xl' : 'rounded-[50%]',
          className,
        )}
        style={{ height, width }}
        onClick={() => expandable && imageModalHandler.open()}
        {...props}
      >
        {!src && <RiGhostLine className='h-3/5 w-3/5 text-sub transition-colors' />}
        <LazyImage src={src} alt={alt} {...imageProps} />
      </div>
      {expandable && src && (
        <Modal
          className='relative select-none overflow-hidden p-0'
          opened={imageModalOpened}
          onClose={imageModalHandler.close}
          trapFocus={false}
          overflow='outside'
        >
          <LazyImage src={src} alt={alt} height={500} width={500} />
        </Modal>
      )}
    </>
  );
}
