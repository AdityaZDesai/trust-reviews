import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AlertCircle, Shield } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  trend?: string;
  trendLabel?: string;
  type: 'positive' | 'negative' | 'warning';
  icon?: string;
  onClick?: () => void;
}

const typeConfig = {
  negative: {
    icon: <AlertCircle className="w-6 h-6 text-offred" />, // left icon
    value: 'text-offred',
    title: 'text-gray-400',
  },
  warning: {
    icon: <AlertCircle className="w-6 h-6 text-offred" />, // left icon
    value: 'text-offred',
    title: 'text-gray-400',
  },
  positive: {
    icon: <Shield className="w-6 h-6 text-dark-slate-gray" />, // left icon
    value: 'text-sgbus-green',
    title: 'text-gray-400',
  },
};

export const MetricCard = ({ title, value, description, type }: MetricCardProps) => {
  const config = typeConfig[type];
  return (
    <Card className="bg-white border-0 shadow-md rounded-3xl">
      <CardContent className="px-10 pb-5 pt-2 flex flex-col h-full justify-between">
        {/* Title row */}
        <div className="flex items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center">{config.icon}</div>
            <h3 className={cn('text-xl font-bold tracking-wide', config.title)}>{title}</h3>
          </div>
        </div>
        {/* Value and description */}
        <div className="flex flex-col gap-2">
          <div className={cn('text-4xl sm:text-5xl md:text-6xl font-extrabold break-words', config.value)}>{value}</div>
          <p className="text-lg text-eerie-black font-medium mt-2">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;

