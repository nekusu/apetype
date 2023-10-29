'use client';

import { useDisclosure, useIntersection, useIsomorphicEffect } from '@mantine/hooks';
import { useGetDocs } from '@tatsuokaniwa/swr-firestore';
import { Button, Modal, Tooltip } from 'components/core';
import { Chart } from 'components/typing-test';
import { ChartProps } from 'components/typing-test/Chart';
import { TypingTest, useUser } from 'context/userContext';
import dayjs from 'dayjs';
import { OrderByDirection, Timestamp } from 'firebase/firestore';
import { m } from 'framer-motion';
import {
  ComponentPropsWithoutRef,
  Dispatch,
  ElementRef,
  ReactNode,
  SetStateAction,
  createContext,
  forwardRef,
  useContext,
  useRef,
  useState,
} from 'react';
import {
  RiArrowUpSFill,
  RiEarthFill,
  RiEyeOffFill,
  RiLineChartFill,
  RiLoaderLine,
  RiVipCrown2Fill,
  RiZzzFill,
} from 'react-icons/ri';
import { twJoin, twMerge } from 'tailwind-merge';

interface InfoIconProps extends ComponentPropsWithoutRef<'div'> {
  label: string;
  icon: ReactNode;
}

interface TableHeaderContext {
  orderBy: OrderByProperty;
  direction: OrderByDirection;
  setOrderBy: Dispatch<SetStateAction<OrderByProperty>>;
  setDirection: Dispatch<SetStateAction<OrderByDirection>>;
  setLimit: Dispatch<SetStateAction<number>>;
}

type OrderByProperty = 'wpm' | 'raw' | 'accuracy' | 'consistency' | 'date';

function InfoIcon({ label, icon, ...props }: InfoIconProps) {
  return (
    <Tooltip label={label}>
      <div {...props}>{icon}</div>
    </Tooltip>
  );
}

type HeaderCellProps = (
  | { property?: string; sortable?: false }
  | { property: OrderByProperty; sortable: true }
) &
  ComponentPropsWithoutRef<'th'>;

const HeaderCell = forwardRef<ElementRef<'th'>, HeaderCellProps>(function HeaderCell(
  { children, className, property, sortable, ...props },
  ref,
) {
  const context = useContext(TableHeaderContext);
  if (!context) return null;
  const { orderBy, direction, setOrderBy, setDirection, setLimit } = context;

  return (
    <th
      ref={ref}
      className={twMerge([
        'rounded-t-lg px-3 py-2 font-normal transition-colors group',
        sortable && 'cursor-pointer hover:bg-sub-alt hover:text-text',
        className,
      ])}
      scope='col'
      onClick={() => {
        if (!sortable) return;
        if (orderBy === property) setDirection(direction === 'asc' ? 'desc' : 'asc');
        else setDirection('desc');
        setOrderBy(property);
        setLimit(10);
      }}
      {...props}
    >
      {sortable ? (
        <div className='flex items-center gap-1.5 transition-transform group-active:translate-y-0.5'>
          {property ?? children}
          <RiArrowUpSFill
            className={twJoin([
              'transition-property-[transform,opacity] transition-duration-150',
              orderBy !== property && 'opacity-0',
              direction === 'desc' && 'rotate-180',
            ])}
          />
        </div>
      ) : (
        property ?? children
      )}
    </th>
  );
});

const TableHeaderContext = createContext<TableHeaderContext | null>(null);

export default function TestHistory() {
  const { user } = useUser();
  const tableRef = useRef<HTMLTableElement>(null);
  const { ref, entry } = useIntersection({ root: tableRef.current, threshold: 0.1 });
  const [onScreen, setOnScreen] = useState(false);
  const [orderBy, setOrderBy] = useState<OrderByProperty>('date');
  const [direction, setDirection] = useState<OrderByDirection>('desc');
  const [limit, setLimit] = useState(10);
  const { data: tests, isLoading } = useGetDocs<TypingTest>(
    user && onScreen
      ? {
          path: `users/${user.id}/tests`,
          orderBy: [[orderBy === 'date' ? 'date' : `result.${orderBy}`, direction]],
          limit,
        }
      : null,
  );
  const [chartTest, setChartTest] = useState<ChartProps>();
  const [chartModalOpen, chartModalHandler] = useDisclosure(false);

  useIsomorphicEffect(() => {
    if (entry?.isIntersecting) setOnScreen(true);
  }, [entry?.isIntersecting]);

  return (
    <div className='flex flex-col items-center gap-4'>
      <table ref={ref} className='w-full border-spacing-none cursor-default'>
        <thead className='sticky top-0'>
          <tr className='absolute inset-0 rounded-b-lg bg-bg transition-colors -top-[1px] -z-1' />
          <TableHeaderContext.Provider
            value={{ orderBy, direction, setOrderBy, setDirection, setLimit }}
          >
            <tr className='text-left text-sm text-sub'>
              <HeaderCell className='pl-4 pr-0'>
                <RiLoaderLine
                  className={twJoin([
                    'transition text-main',
                    isLoading ? 'opacity-100 animate-spin' : 'opacity-0',
                  ])}
                />
              </HeaderCell>
              <HeaderCell property='wpm' sortable />
              <HeaderCell property='raw' sortable />
              <HeaderCell property='accuracy' sortable />
              <HeaderCell property='consistency' sortable />
              <Tooltip label='correct/incorrect/extra/missed' placement='top'>
                <HeaderCell property='characters' />
              </Tooltip>
              <HeaderCell property='mode' />
              <HeaderCell property='info' />
              <HeaderCell className='rounded-r-lg' property='date' sortable />
            </tr>
          </TableHeaderContext.Provider>
        </thead>
        <tbody>
          {tests?.map(
            ({
              id,
              language,
              date,
              mode,
              mode2,
              result,
              blindMode,
              lazyMode,
              isPb,
              stats,
              duration,
            }) => {
              const { wpm, raw, accuracy, consistency, characterStats } = result;
              const { correct, incorrect, extra, missed } = characterStats;
              return (
                <m.tr
                  key={id}
                  className='align-middle text-text transition-colors even:bg-bg odd:bg-sub-alt'
                  layout
                  layoutScroll
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, type: 'spring' }}
                >
                  <td className='rounded-l-xl py-3 pl-4 text-main transition-colors'>
                    {isPb && <RiVipCrown2Fill />}
                  </td>
                  <td className='p-3'>{wpm.toFixed(2)}</td>
                  <td className='p-3'>{raw.toFixed(2)}</td>
                  <td className='p-3'>{accuracy.toFixed(2)}%</td>
                  <td className='p-3'>{consistency.toFixed(2)}%</td>
                  <td className='p-3'>
                    {correct}/{incorrect}/{extra}/{missed}
                  </td>
                  <td className='p-3'>
                    {mode} {mode2}
                  </td>
                  <td className='p-3'>
                    <div className='flex gap-1.5'>
                      <InfoIcon label={language} icon={<RiEarthFill />} />
                      {blindMode && <InfoIcon label='blind mode' icon={<RiEyeOffFill />} />}
                      {lazyMode && <InfoIcon label='lazy mode' icon={<RiZzzFill />} />}
                      <Tooltip label='view chart'>
                        <Button
                          className='p-0 text-text'
                          onClick={() => {
                            setChartTest({ stats, elapsedTime: duration });
                            chartModalHandler.open();
                          }}
                        >
                          <RiLineChartFill />
                        </Button>
                      </Tooltip>
                    </div>
                  </td>
                  <td className='rounded-r-xl p-3'>
                    {dayjs.unix((date as unknown as Timestamp).seconds).format('DD MMM YYYY HH:mm')}
                  </td>
                </m.tr>
              );
            },
          )}
        </tbody>
      </table>
      {user && tests && tests.length < user.typingStats.completedTests && (
        <Button
          className='min-w-1/4 px-3'
          disabled={isLoading}
          variant='filled'
          onClick={() => setLimit((value) => value + 10)}
        >
          load more
        </Button>
      )}
      <Modal
        backdropClassName='overflow-hidden'
        className='w-3xl'
        open={chartModalOpen}
        onClose={chartModalHandler.close}
        centered
        overflow='outside'
      >
        {chartTest && <Chart {...chartTest} />}
      </Modal>
    </div>
  );
}
