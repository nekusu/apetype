'use client';

import { Modal } from '@/components/core';
import type { ModalProps } from '@/components/core/Modal';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export interface ParallelRouteModalProps extends Omit<ModalProps, 'opened' | 'onClose'> {
  routes: string[];
}

export default function ParallelRouteModal({
  children,
  routes,
  ...props
}: ParallelRouteModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const lastPathname = useRef('/');
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    const opened = routes.some((r) => pathname.includes(r));
    setOpened(opened);
    if (!opened) lastPathname.current = pathname;
  }, [pathname, routes]);

  return (
    <Modal
      opened={opened}
      onClose={() => router.push(lastPathname.current)}
      layout
      transition={{ type: 'spring', bounce: 0.6, layout: { type: 'spring', duration: 0.25 } }}
      style={{ borderRadius: 12 }}
      {...props}
    >
      {children}
    </Modal>
  );
}
