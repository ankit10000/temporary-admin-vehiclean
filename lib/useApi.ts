'use client';
import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<T | null>;
}

export function useApi<T = any>(apiFunc: (...args: any[]) => Promise<any>): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFunc(...args);
      const result = response.data?.data || response.data;
      setData(result);
      return result;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Something went wrong';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiFunc]);

  return { data, loading, error, execute };
}
