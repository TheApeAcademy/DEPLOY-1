import { useState, useEffect, useCallback } from 'react';
import type { Assignment, TableFilters } from '@/types';
import { getAllAssignments, updateAssignmentStatus } from '@/services/database';

export const useAssignments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filters, setFilters] = useState<TableFilters>({ search: '', status: '', sortBy: 'createdAt', sortOrder: 'desc' });
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const { data } = await getAllAssignments({ status: filters.status || undefined, search: filters.search || undefined });
    setAssignments(data);
    setIsLoading(false);
  }, [filters.status, filters.search]);

  useEffect(() => { load(); }, [load]);

  const updateFilters = (updates: Partial<TableFilters>) => setFilters(prev => ({ ...prev, ...updates }));

  const updateStatus = async (id: string, status: string) => {
    await updateAssignmentStatus(id, { status });
    await load();
  };

  return { assignments, filters, updateFilters, isLoading, refresh: load, updateStatus };
};
