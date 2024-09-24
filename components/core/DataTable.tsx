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
import { RiArrowDownLine } from 'react-icons/ri';
import { twJoin } from 'tailwind-merge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './Table';

export interface DataTableProps<TData> extends Omit<TableOptions<TData>, 'getCoreRowModel'> {
  loading?: boolean;
  stickyHeader?: boolean;
}

export function DataTable<TData extends { id: string }>({
  loading,
  stickyHeader,
  ...options
}: DataTableProps<TData>) {
  const { getHeaderGroups, getRowModel } = useReactTable({
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
    manualSorting: true,
    enableMultiSort: false,
    ...options,
  });
  const { ref: intersectionRef, entry } = useIntersection({ threshold: 1 });

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
            entry && !entry.isIntersecting && 'rounded-b-xl bg-bg shadow-xl',
          )}
        >
          {getHeaderGroups().map(({ id, headers }) => (
            <TableRow key={id} className='text-left text-sm'>
              {headers.map(({ id, column, getContext }) => {
                const { header, enableSorting } = column.columnDef;
                const isSorted = column.getIsSorted();
                return (
                  <TableHead
                    key={id}
                    className={twJoin(
                      enableSorting && 'cursor-pointer hover:bg-sub-alt hover:text-text',
                      entry && !entry.isIntersecting && 'rounded-t-none',
                    )}
                    onClick={() =>
                      enableSorting &&
                      column.toggleSorting(isSorted === false || isSorted === 'asc')
                    }
                  >
                    {enableSorting ? (
                      <div className='-my-2 -mx-3 flex items-center gap-1.5 p-[inherit] transition-transform active:translate-y-0.5'>
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
            getRowModel().rows.map(({ id, getVisibleCells }) => (
              <TableRow
                key={id}
                layoutId={id}
                layoutScroll
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, type: 'spring' }}
              >
                {getVisibleCells().map(({ id, column, getContext }) => (
                  <TableCell key={id}>{flexRender(column.columnDef.cell, getContext())}</TableCell>
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
