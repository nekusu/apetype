'use client';

import { getUserById } from '@/queries/get-user-by-id';
import { userStatsByIdQueryKey } from '@/queries/get-user-stats-by-id';
import supabase from '@/utils/supabase/browser';
import type {
  Database,
  TableInsert,
  TableRow,
  TableUpdate,
} from '@/utils/supabase/database-extended';
import {
  useQuery,
  useUpdateMutation,
  useUpsertItem,
} from '@supabase-cache-helpers/postgrest-react-query';
import { useQueryClient } from '@tanstack/react-query';
import { mapValues } from 'radashi';
import { type ReactNode, createContext, useContext } from 'react';
import { toast } from 'react-hot-toast';

export interface UserContext {
  user?: TableRow<'users'> | null;
  updateUser: (data: Omit<TableUpdate<'users'>, 'id'>) => Promise<void>;
  incrementStats: (
    data: Omit<Database['public']['Functions']['increment_stats']['Args'], 'id'>,
  ) => Promise<void>;
  insertTest: (data: Omit<TableInsert<'tests'>, 'userId'>) => Promise<boolean | undefined>;
}

export interface UserProviderProps {
  id?: string;
  children: ReactNode;
}

export const UserContext = createContext<UserContext | null>(null);

export function UserProvider({ children, id }: UserProviderProps) {
  const queryClient = useQueryClient();
  const { data: user } = useQuery(getUserById(supabase, id), { enabled: !!id });
  const { mutateAsync: _updateUser } = useUpdateMutation(supabase.from('users'), ['id']);
  const upsertStats = useUpsertItem<TableUpdate<'user_stats'>>({
    primaryKeys: ['userId'],
    table: 'user_stats',
    schema: 'public',
  });

  const updateUser: UserContext['updateUser'] = async (data) => {
    if (!id) return;
    try {
      await _updateUser({ id, ...data });
    } catch (e) {
      toast.error(`Failed to update user data! ${(e as Error).message}`);
    }
  };
  const incrementCacheStats: UserContext['incrementStats'] = async (data) => {
    if (!id) return;
    const { data: userStats } = queryClient.getQueryData(userStatsByIdQueryKey(supabase, id)) as {
      data: TableRow<'user_stats'> | null;
    };
    if (userStats)
      await upsertStats({ userId: id, ...mapValues(data, (value, key) => userStats[key] + value) });
    else
      await queryClient.invalidateQueries({
        predicate: ({ queryKey }) => queryKey.includes('user_stats'),
      });
  };
  const incrementStats: UserContext['incrementStats'] = async (data) => {
    if (!id) return;
    try {
      await supabase.rpc('increment_stats', { id, ...data }).throwOnError();
      await incrementCacheStats(data);
    } catch (e) {
      toast.error(`Failed to update user stats! ${(e as Error).message}`);
    }
  };
  const insertTest: UserContext['insertTest'] = async (data) => {
    if (!id) return;
    try {
      const { data: test } = await supabase
        .from('tests')
        .insert({ userId: id, ...data })
        .select('isPb')
        .throwOnError()
        .single();
      const { isPb = false } = test ?? {};
      queryClient.setQueriesData(
        { predicate: ({ queryKey }) => queryKey.includes('tests') },
        (data) => {
          const { pages, pageParams } = data as { pages: unknown[]; pageParams: unknown[] };
          return { pages: pages.slice(0, 1), pageParams: pageParams.slice(0, 1) };
        },
      );
      await queryClient.invalidateQueries({
        predicate: ({ queryKey }) =>
          queryKey.includes('user_stats') ||
          queryKey.includes('tests') ||
          (isPb && queryKey.includes('personal_bests')),
      });
      return isPb;
    } catch (e) {
      toast.error(`Failed to upload test result! ${(e as Error).message}`);
    }
  };

  return (
    <UserContext.Provider
      value={{ user: id ? user : null, updateUser, incrementStats, insertTest }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
}
