import '@tanstack/react-query';

interface MyMeta extends Record<string, unknown> {
  disablePersister: boolean;
}

declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: MyMeta;
  }
}
