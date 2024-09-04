'use client';

import { Modal } from '@/components/core';
import type { ModalProps } from '@/components/core/Modal';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export interface ParallelRouteModalProps extends Omit<ModalProps, 'open' | 'onClose'> {
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
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const open = routes.some((r) => pathname.includes(r));
    setOpen(open);
    if (!open) lastPathname.current = pathname;
  }, [pathname, routes]);

  return (
    <Modal
      centered
      open={open}
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
