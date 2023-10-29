'use client';

import Loading, { LoadingProps } from 'app/loading';
import { AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ComponentPropsWithoutRef, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

export interface LazyImageProps extends Optional<ComponentPropsWithoutRef<typeof Image>, 'src'> {
  loadingProps?: LoadingProps;
}

export default function LazyImage({ loadingProps: _loadingProps, ...props }: LazyImageProps) {
  const { src, onLoadingComplete } = props;
  const { className: loadingClassName, ...loadingProps } = _loadingProps ?? {};
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(!!src);
  }, [src]);

  return (
    <>
      {src && (
        // eslint-disable-next-line jsx-a11y/alt-text
        <Image
          src={src}
          onLoadingComplete={(img) => {
            setIsLoading(false);
            onLoadingComplete?.(img);
          }}
          {...props}
        />
      )}
      <AnimatePresence>
        {isLoading && (
          <Loading
            className={twMerge(['absolute bg-bg -inset-1', loadingClassName])}
            logoIconProps={{ width: '60' }}
            transition={{ duration: 0.25 }}
            {...loadingProps}
          />
        )}
      </AnimatePresence>
    </>
  );
}
