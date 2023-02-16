'use client';

import { ChartTypeRegistry, TooltipModel } from 'chart.js';
import clsx from 'clsx';
import { Text } from 'components/core';
import { motion } from 'framer-motion';
import { memo } from 'react';

export interface ChartTooltipProps {
  position: { top: number; left: number };
  data?: TooltipModel<keyof ChartTypeRegistry>;
  disabled: boolean;
}

function ChartTooltip({ position, data, disabled }: ChartTooltipProps) {
  return (
    <motion.div
      className={clsx([
        'pointer-events-none absolute rounded-lg bg-sub-alt py-2.5 px-3 shadow-md transition',
        disabled ? 'opacity-0' : 'opacity-100',
      ])}
      animate={{ top: position?.top, left: position?.left }}
    >
      {data && (
        <>
          <div className='flex flex-col gap-1'>
            {data.dataPoints.map((data) => (
              <div key={data?.dataset.label ?? ''} className='flex items-center gap-1.5'>
                <Text
                  className='text-[13px] leading-none'
                  style={{ color: data?.dataset.borderColor as string }}
                >
                  {data?.dataset.label ?? ''}
                </Text>
                <Text className='text-[13px] leading-none'>{data?.parsed.y}</Text>
              </div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}

export default memo(ChartTooltip);
