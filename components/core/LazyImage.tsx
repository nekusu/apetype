'use client';

import Loading, { type LoadingProps } from '@/app/loading';
import { useDidUpdate } from '@mantine/hooks';
import { AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { type ComponentPropsWithoutRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

export interface LazyImageProps extends Optional<ComponentPropsWithoutRef<typeof Image>, 'src'> {
  loadingProps?: LoadingProps;
}

export default function LazyImage({
  loadingProps: _loadingProps,
  onLoad,
  src,
  ...props
}: LazyImageProps) {
  const { className: loadingClassName, ...loadingProps } = _loadingProps ?? {};
  const [isLoading, setIsLoading] = useState(false);

  useDidUpdate(() => {
    setIsLoading(!!src);
  }, [src]);

  return (
    <>
      {src && (
        <Image
          src={src}
          onLoad={(img) => {
            setIsLoading(false);
            onLoad?.(img);
          }}
          {...props}
        />
      )}
      <AnimatePresence>
        {isLoading && (
          <Loading
            className={twMerge('-inset-1 absolute bg-bg', loadingClassName)}
            logoIconProps={{ width: '60' }}
            transition={{ duration: 0.25 }}
            {...loadingProps}
          />
        )}
      </AnimatePresence>
    </>
  );
}
