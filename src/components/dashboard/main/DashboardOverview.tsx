import React from 'react';
import MetricCard from './MetricCard';
import DangerChart from './DangerChart';
import RevenueChart from './RevenueChart';
import { useDashboardData } from '@/hooks/use-dashboard-data';

export const DashboardOverview = () => {
  const dashboardData = useDashboardData();
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
          value={dashboardData.revenueLoss.value}
          description={dashboardData.revenueLoss.description}
          trend={dashboardData.revenueLoss.trend}
          trendLabel={dashboardData.revenueLoss.trendLabel}
          type="negative"
          icon="📉"
        />
        <MetricCard
          title="Critical Alerts"
          value={dashboardData.criticalAlerts.value}
          description={dashboardData.criticalAlerts.description}
          trend={dashboardData.criticalAlerts.trend}
          trendLabel={dashboardData.criticalAlerts.trendLabel}
          type="warning"
          icon="⚠️"
        />
        <MetricCard
          title="Posts Taken Down"
          value={dashboardData.postsTakenDown.value}
          description={dashboardData.postsTakenDown.description}
          trend={dashboardData.postsTakenDown.trend}
          trendLabel={dashboardData.postsTakenDown.trendLabel}
          type="positive"
          icon="🛡️"
        />
      </div>

      {/* Charts Section: 1-2 grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-2">
        <div className="col-span-1">
          <DangerChart data={dashboardData.dangerBySource} />
        </div>
        <div className="col-span-1 lg:col-span-2">
          <RevenueChart data={dashboardData.revenueLossBreakdown} />
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
