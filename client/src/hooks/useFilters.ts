import { useSearchParams } from 'react-router-dom';
import { useCallback } from 'react';

export function useFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const getFilter = useCallback((key: string) => searchParams.get(key) ?? '', [searchParams]);

  const setFilter = useCallback((key: string, value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const clearFilters = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  const toQueryObject = useCallback((): Record<string, string> => {
    const obj: Record<string, string> = {};
    searchParams.forEach((v, k) => { if (v) obj[k] = v; });
    return obj;
  }, [searchParams]);

  return { getFilter, setFilter, clearFilters, toQueryObject };
}
