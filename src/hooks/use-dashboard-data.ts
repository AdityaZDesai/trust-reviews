// hooks/useDashboardData.ts
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { DashboardData } from '@/lib/models';

// Define the API response type
interface ApiDashboardData {
  commissionBySource: { source: string; commission: number }[];
  totalCommission: number;
  todayCount: number;
  sourceCounts: { source: string; count: number }[];
  listings: {
    id?: string;
    source?: string;
    summary?: string;
    text?: string;
    description?: string;
    timestamp?: string | number;
    status?: 'active' | 'awaiting' | 'deleted';
    url?: string;
    link?: string;
  }[];
  deletedReviewsCount: number;
}

export function useDashboardData() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [apiData, setApiData] = useState<ApiDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // don't fetch until we know the user's email
    if (!user?.email) return;

    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/dashboard?email=${encodeURIComponent(user.email || '')}`
        );
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || res.statusText);
        }
        const json = await res.json();
        setApiData(json);
        
        // Transform API data to the format expected by components
        const transformedData: DashboardData = {
          revenueLoss: {
            value: `-$${json.totalCommission.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            description: "Potential revenue lost.",
            trend: "+118%",
            trendLabel: "From last month"
          },
          criticalAlerts: {
            value: `${json.todayCount}+`,
            description: "Listings requiring attention today.",
            trend: "+8%",
            trendLabel: "From yesterday"
          },
          postsTakenDown: {
            value: `${json.deletedReviewsCount}+`,
            description: "Posts with 'deleted' status.",
            trend: "+8%",
            trendLabel: "From yesterday"
          },
          dangerBySource: json.sourceCounts.map(({ source, count }, index) => ({
            platform: source.charAt(0).toUpperCase() + source.slice(1),
            percentage: Math.round((count / json.sourceCounts.reduce((sum, { count }) => sum + count, 0)) * 100),
            color: getColorForIndex(index)
          })),
          revenueLossBreakdown: json.commissionBySource.map(({ source, commission }) => ({
            platform: source.charAt(0).toUpperCase() + source.slice(1),
            amount: Math.round(commission),
            color: "#F40B0B"
          }))
        };
        
        setData(transformedData);
      } catch (err: unknown) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user?.email]);

  return { data, apiData, loading, error };
}

// Helper function to get colors for the danger chart
function getColorForIndex(index: number): string {
  const colors = ["#F40B0B", "#FF6B35", "#FF8E53", "#FFA071", "#FFB08F"];
  return colors[index % colors.length];
}
