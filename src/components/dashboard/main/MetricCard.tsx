import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, AlertCircle, Shield, TrendingUp } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  trend: string;
  trendLabel: string;
  type: 'positive' | 'negative' | 'warning';
  icon?: string;
}

const typeConfig = {
  negative: {
    icon: <AlertCircle className="w-6 h-6 text-offred" />, // left icon
    circle: 'bg-offred',
    arrow: <ArrowUpRight className="w-7 h-7 text-white" />, // top-right
    value: 'text-offred',
    pill: 'bg-offred',
    pillIcon: <ArrowUpRight className="w-4 h-4 text-white" />, // pill
    title: 'text-gray-400',
  },
  warning: {
    icon: <AlertCircle className="w-6 h-6 text-offred" />, // left icon
    circle: 'bg-offred',
    arrow: <ArrowUpRight className="w-7 h-7 text-white" />, // top-right
    value: 'text-offred',
    pill: 'bg-offred',
    pillIcon: <ArrowUpRight className="w-4 h-4 text-white" />, // pill
    title: 'text-gray-400',
  },
  positive: {
    icon: <Shield className="w-6 h-6 text-dark-slate-gray" />, // left icon
    circle: 'bg-dark-slate-gray',
    arrow: <ArrowUpRight className="w-7 h-7 text-sgbus-green" />, // top-right
    value: 'text-sgbus-green',
    pill: 'bg-sgbus-green',
    pillIcon: <ArrowUpRight className="w-4 h-4 text-white" />, // pill
    title: 'text-gray-400',
  },
};

export const MetricCard = ({ title, value, description, trend, trendLabel, type }: MetricCardProps) => {
  const config = typeConfig[type];
  return (
    <Card className="bg-white border-0 shadow-md rounded-3xl">
      <CardContent className="px-10 pb-5 pt-2 flex flex-col h-full justify-between">
        {/* Title row */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center">{config.icon}</div>
            <h3 className={cn('text-xl font-bold tracking-wide', config.title)}>{title}</h3>
          </div>
          <div className={cn('w-14 h-14 rounded-full flex items-center justify-center', config.circle)}>
            {config.arrow}
          </div>
        </div>
        {/* Value and description */}
        <div className="flex flex-col gap-2 mb-8">
          <div className={cn('text-6xl font-extrabold', config.value)}>{value}</div>
          <p className="text-lg text-eerie-black font-medium mt-2">{description}</p>
        </div>
        {/* Trend pill */}
        <div className="flex items-center gap-3 mt-auto">
          <span className={cn('inline-flex items-center gap-1 px-4 py-2 rounded-full text-base font-bold text-white', config.pill)}>
            {config.pillIcon}
            {trend}
          </span>
          <span className="text-base font-bold text-eerie-black">{trendLabel}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;

