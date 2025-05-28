import React from 'react';
import MetricCard from './MetricCard';
import DangerChart from './DangerChart';
import RevenueChart from './RevenueChart';
import { useDashboardData } from '@/hooks/use-dashboard-data';

interface DashboardOverviewProps {
  onNavigateToListings?: () => void;
}

export const DashboardOverview = ({ onNavigateToListings }: DashboardOverviewProps) => {
  const { data, loading, error } = useDashboardData();
  
  if (loading) {
    return <div className="p-8 text-center">Loading dashboard data...</div>;
  }
  
  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }
  
  if (!data) {
    return <div className="p-8 text-center">No dashboard data available</div>;
  }
  
  return (
    <div className="space-y-8">
      {/* Welcome Message */}
      <div className="mb-2">
        <h1 className="text-lg text-eerie-black font-normal mb-1">Hey, User</h1>
        <h2 className="text-3xl md:text-4xl font-bold text-sgbus-green mb-4">Your Risk Overview</h2>
      </div>

      {/* Metric Cards: 1-1-1 grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Revenue Loss"
          value={data.revenueLoss.value}
          description={data.revenueLoss.description}
          trend={data.revenueLoss.trend}
          trendLabel={data.revenueLoss.trendLabel}
          type="negative"
          icon="📉"
          onClick={onNavigateToListings}
        />
        <MetricCard
          title="Critical Alerts"
          value={data.criticalAlerts.value}
          description={data.criticalAlerts.description}
          trend={data.criticalAlerts.trend}
          trendLabel={data.criticalAlerts.trendLabel}
          type="warning"
          icon="⚠️"
          onClick={onNavigateToListings}
        />
        <MetricCard
          title="Posts Taken Down"
          value={data.postsTakenDown.value}
          description={data.postsTakenDown.description}
          trend={data.postsTakenDown.trend}
          trendLabel={data.postsTakenDown.trendLabel}
          type="positive"
          icon="🛡️"
          onClick={onNavigateToListings}
        />
      </div>

      {/* Charts Section: 1-2 grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-2">
        <div className="col-span-1">
          <DangerChart data={data.dangerBySource} />
        </div>
        <div className="col-span-1 lg:col-span-2">
          <RevenueChart data={data.revenueLossBreakdown} />
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
