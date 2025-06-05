
import { useState } from 'react';

type LoadingState = Record<string, boolean>;

export function useLoadingStates() {
  const [loadingStates, setLoadingStates] = useState<LoadingState>({});

  const setLoading = (key: string, isLoading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading
    }));
  };

  const isLoading = (key: string) => Boolean(loadingStates[key]);

  const withLoading = async <T>(key: string, asyncFn: () => Promise<T>): Promise<T> => {
    setLoading(key, true);
    try {
      return await asyncFn();
    } finally {
      setLoading(key, false);
    }
  };

  return {
    setLoading,
    isLoading,
    withLoading,
    loadingStates
  };
}
