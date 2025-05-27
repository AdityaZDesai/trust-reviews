import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { getPlatformLogo } from './platformLogo';
import { ArrowRightLeft } from 'lucide-react';

interface DangerChartProps {
  data: Array<{
    platform: string;
    percentage: number;
    color: string;
  }>;
}

const CIRCLE_RADIUS = 60;
const CIRCLE_CIRCUM = 2 * Math.PI * CIRCLE_RADIUS;

function getDonutSegments(data: DangerChartProps['data']) {
  let offset = 0;
  return data.map((item) => {
    const length = (item.percentage / 100) * CIRCLE_CIRCUM;
    const segment = {
      ...item,
      offset,
      length,
    };
    offset += length;
    return segment;
  });
}

const DangerChart = ({ data }: DangerChartProps) => {
  const mainPlatform = data[0];
  const segments = getDonutSegments(data);

  return (
    <Card className="bg-white border-0 shadow-md rounded-3xl">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-2">
          <ArrowRightLeft className="text-offred w-6 h-6" />
          <h3 className="text-xl font-semibold text-dark-slate-gray">Danger by Source</h3>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row items-center justify-between gap-6 pt-2 pb-6">
        {/* Legend */}
        <div className="flex flex-col gap-4 w-full max-w-xs">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              {getPlatformLogo(item.platform, item.color, 'w-7 h-7')}
              <span className="text-lg font-medium text-dark-slate-gray">{item.platform} <span className="font-normal">{item.percentage}%</span></span>
            </div>
          ))}
        </div>
        {/* Donut Chart */}
        <div className="relative flex items-center justify-center w-56 h-56">
          <svg width={150} height={150} viewBox="0 0 150 150" className="block">
            <circle
              cx="75"
              cy="75"
              r={CIRCLE_RADIUS}
              fill="none"
              stroke="#f3f4f6"
              strokeWidth={18}
            />
            {segments.map((seg, i) => (
              <circle
                key={seg.platform}
                cx="75"
                cy="75"
                r={CIRCLE_RADIUS}
                fill="none"
                stroke={seg.color}
                strokeWidth={18}
                strokeDasharray={`${seg.length} ${CIRCLE_CIRCUM - seg.length}`}
                strokeDashoffset={-seg.offset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.3s' }}
              />
            ))}
          </svg>
          {/* Center label */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full shadow-md px-6 py-3 flex flex-col items-center justify-center">
            <span className="text-dark-slate-gray font-bold text-sm">{mainPlatform.platform}</span>
            <span className="text-dark-slate-gray text-sm font-semibold">{mainPlatform.percentage}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DangerChart;