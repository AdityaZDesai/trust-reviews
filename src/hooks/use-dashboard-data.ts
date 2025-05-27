import { useState } from 'react';
import { dashboardData } from '@/data/dashboardMockData';
import type { DashboardData } from '@/lib/models';

export function useDashboardData(): DashboardData {
  // In a real API, you might fetch and set state here
  // For now, just return the mock data
  return dashboardData as DashboardData;
} 