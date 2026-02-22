import { useState, useEffect, useCallback } from 'react';
import type { ActivityLog, TableFilters } from '@/types';
import { getActivityLogs } from '@/services/database';

export const useActivityLogs = (limit = 100) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filters, setFilters] = useState<TableFilters>({ search: '', status: '', sortBy: 'timestamp', sortOrder: 'desc' });
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const data = await getActivityLogs(limit);
    setLogs(data);
    setIsLoading(false);
  }, [limit]);

  useEffect(() => { load(); }, [load]);

  const updateFilters = (updates: Partial<TableFilters>) => setFilters(prev => ({ ...prev, ...updates }));

  return { logs, filters, updateFilters, isLoading, refresh: load };
};
