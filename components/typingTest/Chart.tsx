'use client';

import {
  CategoryScale,
  Chart as ChartJS,
  ChartData,
  ChartOptions,
  Filler,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  ScatterController,
  Tooltip,
} from 'chart.js';
import { useSettings } from 'context/settingsContext';
import { useTypingTest } from 'context/typingTestContext';
import { useMemo, useRef } from 'react';
import { Chart as MultitypeChart } from 'react-chartjs-2';
import { useImmer } from 'use-immer';
import ChartTooltip, { ChartTooltipProps } from './ChartTooltip';

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

function getTheme() {
  const style = getComputedStyle(document.documentElement);
  const fontFamily = style.getPropertyValue('--font');
  const colors = {
    main: style.getPropertyValue('--main-color'),
    sub: style.getPropertyValue('--sub-color'),
    subAlt: style.getPropertyValue('--sub-alt-color'),
    text: style.getPropertyValue('--text-color'),
    colorfulError: style.getPropertyValue('--colorful-error-color'),
  };

  return { fontFamily, colors };
}

export default function Chart() {
  const { showDecimalPlaces } = useSettings();
  const { stats, elapsedTime } = useTypingTest();
  const { raw, wpm, errors } = stats;
  const [tooltip, setTooltip] = useImmer<ChartTooltipProps>({
    position: { top: 0, left: 0 },
    disabled: true,
  });
  const chartRef = useRef(null);
  const { fontFamily, colors } = useMemo(() => getTheme(), []);
  const labels = Array.from({ length: stats.raw.length }, (_, i) => i + 1);

  if (stats.raw.length > elapsedTime) {
    labels[stats.raw.length - 1] = elapsedTime;
  }
  const style = {
    font: { family: fontFamily },
    color: colors.sub,
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
        grid: { color: colors.subAlt },
      },
      wpm: {
        axis: 'y',
        title: { display: true, text: 'Words per Minute', ...style },
        beginAtZero: true,
        min: 0,
        ticks,
        grid: { color: colors.subAlt },
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
        borderColor: colors.sub,
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
        borderColor: colors.main,
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
        borderColor: colors.colorfulError,
        pointBackgroundColor: colors.colorfulError,
        borderWidth: 2,
        yAxisID: 'error',
        order: 1,
        pointStyle: 'crossRot',
      },
    ],
  };

  return (
    <div className='relative h-[200px] max-h-[200px] w-full'>
      <MultitypeChart
        ref={chartRef}
        className='!w-full'
        type='line'
        options={options}
        data={data}
      />
      {!!tooltip.position.top && <ChartTooltip {...tooltip} />}
    </div>
  );
}
