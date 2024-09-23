'use client';

import Loading from '@/app/loading';
import { Text } from '@/components/core/Text';
import { useSettings } from '@/context/settingsContext';
import { useTheme } from '@/context/themeContext';
import type { TypingTestValues } from '@/context/typingTestContext';
import { type ThemeColors, validateColor } from '@/utils/theme';
import type { ChartData, ChartOptions, ChartTypeRegistry, TooltipModel } from 'chart.js';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { twJoin } from 'tailwind-merge';
import { useImmer } from 'use-immer';

const ReactChart = dynamic(
  async () => {
    const {
      Chart: ChartJS,
      CategoryScale,
      Filler,
      LinearScale,
      LineController,
      LineElement,
      PointElement,
      ScatterController,
      Tooltip,
    } = await import('chart.js');
    ChartJS.register(
      CategoryScale,
      Filler,
      LinearScale,
      LineController,
      LineElement,
      PointElement,
      ScatterController,
      Tooltip,
    );
    const { Chart } = await import('react-chartjs-2');
    return Chart;
  },
  {
    loading: () => (
      <Loading
        transition={{ duration: 0.15 }}
        style={{ height: 200 }}
        logoIconProps={{ width: '60' }}
      />
    ),
    ssr: false,
  },
);

export type ChartProps = Pick<TypingTestValues, 'chartData' | 'elapsedTime'>;

interface ChartTooltipProps {
  position: { top: number; left: number };
  data?: TooltipModel<keyof ChartTypeRegistry>;
  disabled: boolean;
}

function ChartTooltip({ position: { top, left }, data, disabled }: ChartTooltipProps) {
  return (
    <div
      className={twJoin(
        'pointer-events-none absolute rounded-lg bg-sub-alt px-3 py-2.5 shadow-md transition-all',
        disabled ? 'opacity-0' : 'opacity-100',
      )}
      style={{ top, left }}
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
    </div>
  );
}

export function Chart({ chartData, elapsedTime }: ChartProps) {
  const { showDecimalPlaces, themeType } = useSettings();
  const { colors: themeColors } = useTheme();
  const { raw, wpm, errors } = chartData;
  const [tooltip, setTooltip] = useImmer<ChartTooltipProps>({
    position: { top: 0, left: 0 },
    disabled: true,
  });
  const colors = useMemo(
    () =>
      Object.entries(themeColors[themeType] ?? {}).reduce((colors, [key, color]) => {
        colors[key] = validateColor(color).color;
        return colors;
      }, {} as ThemeColors),
    [themeColors, themeType],
  );

  const labels = Array.from({ length: chartData.raw.length }, (_, i) => i + 1);
  if (chartData.raw.length > elapsedTime) labels[chartData.raw.length - 1] = elapsedTime;
  const style = {
    font: { family: getComputedStyle(document.body).getPropertyValue('--font') },
    color: colors?.sub,
  };
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
          setTooltip((draft) => {
            draft.disabled = context.tooltip.opacity === 0;
          });
          if (context.tooltip.opacity === 0) return;

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
      <ReactChart className='!w-full' type='line' options={options} data={data} />
      {!!tooltip.position.top && <ChartTooltip {...tooltip} />}
    </div>
  );
}
