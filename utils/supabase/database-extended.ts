import type { Database as PostgresSchema } from './database';

type PostgresTables = PostgresSchema['public']['Tables'];

type TableExtensions = {
  users: {
    socials: {
      monkeytype: string;
      github: string;
      x: string;
      youtube: string;
      twitch: string;
      website: string;
    };
  };
  tests: {
    chartData: {
      raw: number[];
      wpm: number[];
      errors: number[];
    };
  };
};

type TakeDefinitionFromSecond<T extends object, P extends object> = Omit<T, keyof P> & P;

type NewTables = {
  [k in keyof PostgresTables]: {
    Row: k extends keyof TableExtensions
      ? TakeDefinitionFromSecond<PostgresTables[k]['Row'], TableExtensions[k]>
      : PostgresTables[k]['Row'];
    Insert: k extends keyof TableExtensions
      ? TakeDefinitionFromSecond<PostgresTables[k]['Insert'], TableExtensions[k]>
      : PostgresTables[k]['Insert'];
    Update: k extends keyof TableExtensions
      ? Partial<TakeDefinitionFromSecond<PostgresTables[k]['Update'], TableExtensions[k]>>
      : PostgresTables[k]['Update'];
  };
};

export type Database = {
  public: Omit<PostgresSchema['public'], 'Tables'> & {
    Tables: NewTables;
  };
};

export type TableName = keyof Database['public']['Tables'];
export type TableRow<T extends TableName> = Database['public']['Tables'][T]['Row'];
export type TableInsert<T extends TableName> = Database['public']['Tables'][T]['Insert'];
export type TableUpdate<T extends TableName> = Database['public']['Tables'][T]['Update'];

export type TableView<View extends keyof Database['public']['Views']> =
  Database['public']['Views'][View]['Row'];
