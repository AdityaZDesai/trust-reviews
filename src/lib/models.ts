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
  status: 'active' | 'awaiting' | 'deleted';
  url?: string;
  timestamp?: number; // Added for sorting by date
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


// Add this to your existing models.ts file

// User model with Slack integration
export interface User {
  id: string;
  email: string;
  // ... other existing user fields
  slackConnected?: boolean;
  slackTeamId?: string;
  slackUserId?: string;
}

// Slack installation model
export interface SlackInstallation {
  teamId: string;
  installation: any; // Slack installation data
  userId: string; // Your app's user ID
  updatedAt: Date;
}