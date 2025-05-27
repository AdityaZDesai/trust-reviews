export const dashboardData = {
    revenueLoss: {
      value: "-$4153.93",
      description: "Potential revenue lost.",
      trend: "+118%",
      trendLabel: "From last month"
    },
    criticalAlerts: {
      value: "47+",
      description: "Listings requiring attention.",
      trend: "+8%",
      trendLabel: "From yesterday"
    },
    postsTakenDown: {
      value: "230+",
      description: "Posts removed.",
      trend: "+8%",
      trendLabel: "From yesterday"
    },
    dangerBySource: [
      { platform: "Google", percentage: 34, color: "#F40B0B" },
      { platform: "Reddit", percentage: 24, color: "#FF6B35" },
      { platform: "Instagram", percentage: 18, color: "#FF8E53" },
      { platform: "TikTok", percentage: 14, color: "#FFA071" },
      { platform: "Misc", percentage: 10, color: "#FFB08F" }
    ],
    revenueLossBreakdown: [
      { platform: "Google", amount: 74779, color: "#F40B0B" },
      { platform: "Reddit", amount: 56635, color: "#F40B0B" },
      { platform: "TikTok", amount: 43887, color: "#F40B0B" },
      { platform: "Instagram", amount: 19027, color: "#F40B0B" },
      { platform: "Misc", amount: 8142, color: "#F40B0B" }
    ]
};
  
export const postsData = [
    {
      id: "1",
      platform: "TikTok",
      platformIcon: "🎵",
      content: "Terrible customer service, waited 3 hours for a response",
      date: "24/2/2022",
      status: "active" as const
    },
    {
      id: "2",
      platform: "Reddit",
      platformIcon: "🔴",
      content: "Terrible customer service, waited 3 hours for a response",
      date: "24/2/2022",
      status: "pending" as const
    },
    {
      id: "3",
      platform: "Google",
      platformIcon: "🔍",
      content: "Terrible customer service, waited 3 hours for a response",
      date: "24/2/2022",
      status: "active" as const
    },
    {
      id: "4",
      platform: "Instagram",
      platformIcon: "📷",
      content: "Terrible customer service, waited 3 hours for a response",
      date: "24/2/2022",
      status: "active" as const
    },
    {
      id: "5",
      platform: "Misc",
      platformIcon: "⚫",
      content: "Terrible customer service, waited 3 hours for a response",
      date: "24/2/2022",
      status: "pending" as const
    },
    {
      id: "6",
      platform: "Reddit",
      platformIcon: "🔴",
      content: "Terrible customer service, waited 3 hours for a response",
      date: "24/2/2022",
      status: "active" as const
    }
];
  