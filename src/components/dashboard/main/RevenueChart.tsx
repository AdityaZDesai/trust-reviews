import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface RevenueChartProps {
  data: Array<{
    platform: string;
    amount: number;
    color: string;
  }>;
}

const AXIS_STEPS = [0, 20000, 40000, 60000, 80000];

export const RevenueChart = ({ data }: RevenueChartProps) => {
  const maxAmount = Math.max(...data.map(item => item.amount));

  return (
    <Card className="bg-white border-0 shadow-md rounded-3xl">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-2">
          <span className="text-offred text-2xl font-bold">$</span>
          <h3 className="text-xl font-semibold text-dark-slate-gray">Revenue Loss Breakdown</h3>
        </div>
      </CardHeader>
      <CardContent className="pt-2 pb-6 flex flex-col justify-between h-full">
        <div className="relative w-full" style={{ minHeight: 260, paddingRight: 80 }}>
          {/* Grid lines and axis labels */}
          <div className="absolute inset-0 flex flex-col justify-between z-0">
            {data.map((_, idx) => (
              <div key={idx} className="h-10 border-t border-gray-200 w-full" />
            ))}
          </div>
          <div className="absolute left-0 right-0 top-0 bottom-0 flex flex-col justify-between z-10">
            {data.map((item, idx) => (
              <div key={item.platform} className="flex items-center h-10">
                {/* Platform label */}
                <div className="w-32 text-right pr-4 text-gray-500 text-lg font-medium">
                  {item.platform}
                </div>
                {/* Bar and value */}
                <div className="flex-1 flex items-center relative" style={{ minWidth: 0 }}>
                  <div
                    className="h-6 rounded-full bg-offred"
                    style={{ width: `${(item.amount / maxAmount) * 100}%`, minWidth: 8 }}
                  ></div>
                  {/* Value at end of bar, always inside card */}
                  <div
                    className="pl-2 flex-shrink-0 text-gray-500 text-base font-semibold"
                    style={{ maxWidth: 72, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                  >
                    ${item.amount.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Vertical axis grid lines and labels */}
          <div className="absolute left-32 right-0 top-0 bottom-0 z-0 flex">
            {AXIS_STEPS.map((step, idx) => (
              <div key={step} className="relative flex-1 h-full">
                <div className="absolute left-0 top-0 bottom-0 border-l border-gray-200" style={{ zIndex: 0 }} />
                <div className="absolute left-0 bottom-[-1.5rem] text-gray-400 text-base font-medium" style={{ zIndex: 1 }}>
                  {step === 0 ? '0' : `${step / 1000}0K`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
