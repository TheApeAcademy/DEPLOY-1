import { useState, useEffect, useCallback } from 'react';
import type { DashboardStats, ChartData } from '@/types';
import { getDashboardStats } from '@/services/database';

interface UseDashboardStatsReturn {
  stats: DashboardStats;
  chartData: { assignments: ChartData; revenue: ChartData; users: ChartData };
  isLoading: boolean;
  refresh: () => void;
}

const emptyChart = (label: string, color: string): ChartData => ({
  labels: Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString('en', { weekday: 'short' });
  }),
  datasets: [{ label, data: [0, 0, 0, 0, 0, 0, 0], color }],
});

export const useDashboardStats = (): UseDashboardStatsReturn => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0, totalAssignments: 0, totalRevenue: 0,
    pendingAssignments: 0, analyzingAssignments: 0, completedAssignments: 0,
    failedPayments: 0, newUsersToday: 0, assignmentsToday: 0, revenueToday: 0,
  });
  const [chartData] = useState({
    assignments: emptyChart('Assignments', '#10b981'),
    revenue: emptyChart('Revenue £', '#059669'),
    users: emptyChart('New Users', '#34d399'),
  });
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    const data = await getDashboardStats();
    setStats(data);
    setIsLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return { stats, chartData, isLoading, refresh: load };
};
