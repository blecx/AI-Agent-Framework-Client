export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncSlice<T> {
  status: AsyncStatus;
  data: T;
  error: string | null;
}

export function createAsyncSlice<T>(data: T): AsyncSlice<T> {
  return {
    status: 'idle',
    data,
    error: null,
  };
}
