// Dashboard metric card model
export interface DashboardMetric {
  value: string;
  description: string;
  trend: string;
  trendLabel: string;
}

// Danger by source model
export interface DangerBySource {
  platform: string;
  percentage: number;
  color: string;
}

// Revenue loss breakdown model
export interface RevenueLossBreakdown {
  platform: string;
  amount: number;
  color: string;
}

// Dashboard data model
export interface DashboardData {
  revenueLoss: DashboardMetric;
  criticalAlerts: DashboardMetric;
  postsTakenDown: DashboardMetric;
  dangerBySource: DangerBySource[];
  revenueLossBreakdown: RevenueLossBreakdown[];
}

// Post model
export interface Post {
  id: string;
  platform: string;
  platformIcon: string;
  content: string;
  date: string;
  status: 'active' | 'pending';
}

// Illustration elements model
export interface DecorativeElement {
  type: string;
  position: string;
}

export interface IllustrationElements {
  personDescription: string;
  decorativeElements: DecorativeElement[];
} 