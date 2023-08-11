'use client';

import {
  CategoryScale,
  ChartData,
  Chart as ChartJS,
  ChartOptions,
  ChartTypeRegistry,
  Filler,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  ScatterController,
  Tooltip,
  TooltipModel,
} from 'chart.js';
import { Text } from 'components/core';
import { useSettings } from 'context/settingsContext';
import { useTheme } from 'context/themeContext';
import { useTypingTest } from 'context/typingTestContext';
import { motion } from 'framer-motion';
import { Chart as MultitypeChart } from 'react-chartjs-2';
import { twJoin } from 'tailwind-merge';
import { useImmer } from 'use-immer';

ChartJS.register(
  CategoryScale,
  Filler,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  ScatterController,
  Tooltip
);

function getFontFamily() {
  return getComputedStyle(document.body).getPropertyValue('--font');
}

export interface ChartTooltipProps {
  position: { top: number; left: number };
  data?: TooltipModel<keyof ChartTypeRegistry>;
  disabled: boolean;
}

function ChartTooltip({ position: { top, left }, data, disabled }: ChartTooltipProps) {
  return (
    <motion.div
      className={twJoin([
        'pointer-events-none absolute rounded-lg bg-sub-alt py-2.5 px-3 shadow-md transition',
        disabled ? 'opacity-0' : 'opacity-100',
      ])}
      animate={{ top, left }}
      transition={{ ease: 'easeOut', duration: 0.2 }}
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

export default function Chart() {
  const { showDecimalPlaces, themeType } = useSettings();
  const theme = useTheme();
  const colors = theme.colors[themeType];
  const { stats, elapsedTime } = useTypingTest();
  const { raw, wpm, errors } = stats;
  const [tooltip, setTooltip] = useImmer<ChartTooltipProps>({
    position: { top: 0, left: 0 },
    disabled: true,
  });

  const labels = Array.from({ length: stats.raw.length }, (_, i) => i + 1);
  if (stats.raw.length > elapsedTime) labels[stats.raw.length - 1] = elapsedTime;
  const style = { font: { family: getFontFamily() }, color: colors?.sub };
  const ticks = {
    precision: 0,
    autoSkip: true,
    autoSkipPadding: 20,
    ...style,
  };
  const options: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' },
    animations: { color: { duration: 0.15 } },
    scales: {
      x: {
        axis: 'x',
        ticks,
        grid: { color: colors?.subAlt },
      },
      wpm: {
        axis: 'y',
        title: { display: true, text: 'Words per Minute', ...style },
        beginAtZero: true,
        min: 0,
        ticks,
        grid: { color: colors?.subAlt },
      },
      error: {
        axis: 'y',
        position: 'right',
        title: { display: true, text: 'Errors', ...style },
        beginAtZero: true,
        max: Math.max(...errors) + 1,
        ticks,
        grid: { display: false },
      },
    },
    plugins: {
      tooltip: {
        enabled: false,
        external: (context) => {
          setTooltip((draft) => void (draft.disabled = context.tooltip.opacity == 0));
          if (context.tooltip.opacity == 0) return;

          const top = context.tooltip.y;
          const left = context.tooltip.x;

          if (tooltip.position.top !== top) {
            setTooltip({
              position: { top, left },
              data: context.tooltip,
              disabled: false,
            });
          }
        },
      },
    },
  };
  const data: ChartData<'line' | 'scatter', (string | number | null)[], number> = {
    labels,
    datasets: [
      {
        type: 'line' as const,
        label: 'raw',
        fill: true,
        data: raw.map((r) => (showDecimalPlaces ? r.toFixed(2) : Math.floor(r))),
        borderColor: colors?.sub,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 2,
        tension: 0.3,
        yAxisID: 'wpm',
        order: 3,
        pointRadius: 2,
      },
      {
        type: 'line' as const,
        label: 'wpm',
        fill: true,
        data: wpm.map((w) => (showDecimalPlaces ? w.toFixed(2) : Math.floor(w))),
        borderColor: colors?.main,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 2,
        tension: 0.3,
        yAxisID: 'wpm',
        order: 2,
        pointRadius: 2,
      },
      {
        type: 'scatter' as const,
        label: 'errors',
        data: errors.map((e) => (e ? e : null)),
        borderColor: colors?.colorfulError,
        pointBackgroundColor: colors?.colorfulError,
        borderWidth: 2,
        yAxisID: 'error',
        order: 1,
        pointStyle: 'crossRot',
      },
    ],
  };

  return (
    <div className='relative h-[200px] w-full'>
      <MultitypeChart className='!w-full' type='line' options={options} data={data} />
      {!!tooltip.position.top && <ChartTooltip {...tooltip} />}
    </div>
  );
}
