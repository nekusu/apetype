'use client';

import Loading from '@/app/loading';
import { useIntersection } from '@mantine/hooks';
import {
  type TableOptions,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { RiArrowDownLine } from 'react-icons/ri';
import { twJoin } from 'tailwind-merge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './Table';

export interface DataTableProps<TData> extends Omit<TableOptions<TData>, 'getCoreRowModel'> {
  loading?: boolean;
  idPrefix?: string;
  idProperty?: keyof TData;
  stickyHeader?: boolean;
}

export function DataTable<TData>({
  loading,
  idPrefix = '',
  idProperty = 'id' as keyof TData,
  stickyHeader,
  ...options
}: DataTableProps<TData>) {
  const { getHeaderGroups, getRowModel } = useReactTable({
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => idPrefix + row[idProperty],
    manualSorting: true,
    enableSortingRemoval: false,
    enableMultiSort: false,
    sortDescFirst: true,
    ...options,
  });
  const { ref: intersectionRef, entry } = useIntersection({ threshold: 1 });
  const [thHoveredIndex, setThHoveredIndex] = useState<number>();

  return (
    <div className='relative'>
      <AnimatePresence>
        {loading && (
          <Loading
            className='pointer-events-none absolute inset-0 z-10 rounded-xl bg-black/10 backdrop-blur-[2.5px]'
            transition={{ duration: 0.15 }}
          />
        )}
      </AnimatePresence>
      <Table>
        <TableHeader
          ref={stickyHeader ? intersectionRef : null}
          className={twJoin(
            stickyHeader && '-top-px sticky',
            entry && !entry.isIntersecting && 'rounded-b-xl bg-bg shadow-xl transition-colors',
          )}
        >
          {getHeaderGroups().map(({ id, headers }) => (
            <TableRow key={id} className='text-left text-sm'>
              {headers.map(({ id, column, getContext }, i) => {
                const { header, enableSorting } = column.columnDef;
                const isSorted = column.getIsSorted();
                return (
                  <TableHead
                    key={id}
                    className={twJoin(
                      enableSorting && 'cursor-pointer hover:bg-sub-alt hover:text-text',
                      isSorted && 'text-text',
                      entry &&
                        !entry.isIntersecting &&
                        'rounded-t-none first:rounded-bl-xl last:rounded-br-xl',
                    )}
                    onClick={() =>
                      enableSorting && column.toggleSorting(undefined, options.enableMultiSort)
                    }
                    onMouseEnter={() =>
                      enableSorting && (i === 0 || i === headers.length - 1) && setThHoveredIndex(i)
                    }
                    onMouseLeave={() => setThHoveredIndex(undefined)}
                  >
                    {isSorted ? (
                      <div
                        className={twJoin(
                          '-my-2 -mx-3 flex items-center gap-1.5 p-[inherit]',
                          enableSorting && 'transition-transform active:translate-y-0.5',
                        )}
                      >
                        {header ? flexRender(header, getContext()) : column.id}
                        <RiArrowDownLine
                          className={twJoin(
                            'transition-[opacity,rotate]',
                            isSorted === 'asc' && '-rotate-180',
                            !isSorted && 'opacity-0',
                          )}
                        />
                      </div>
                    ) : (
                      flexRender(header, getContext())
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {getRowModel().rows?.length ? (
            getRowModel().rows.map(({ id, getVisibleCells }, rowIndex) => (
              <TableRow
                key={id}
                layoutId={id}
                layoutScroll
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, type: 'spring' }}
              >
                {getVisibleCells().map(({ id, column, getContext }, cellIndex) => (
                  <TableCell
                    key={id}
                    className={twJoin(
                      rowIndex === 0 &&
                        cellIndex === thHoveredIndex &&
                        'first:rounded-tl-none last:rounded-tr-none',
                    )}
                  >
                    {flexRender(column.columnDef.cell, getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={options.columns.length} className='text-center'>
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
