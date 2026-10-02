import { BarChart3, Calendar, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { useAuth } from '../hooks/AuthContext';
import { useDailyBreakdown, useReportMetrics } from '../hooks/useReports';
import { formatCurrency } from '../utils/format';
import type { DateRange, DateRangePreset } from '../types/reports';

// Helper to calculate dates based on preset
const getDateRange = (preset: DateRangePreset, customStart?: string, customEnd?: string): DateRange => {
  const end = new Date();
  const start = new Date();
  
  if (preset === 'custom' && customStart && customEnd) {
    return { preset, startDate: customStart, endDate: customEnd };
  }

  const daysMap: Record<string, number> = {
    daily: 0, weekly: 7, monthly: 30, '3months': 90, '6months': 180, yearly: 365,
  };
  
  start.setDate(end.getDate() - (daysMap[preset] || 0));
  return {
    preset,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
};

const presets: { label: string; value: DateRangePreset }[] = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: '3 Months', value: '3months' },
  { label: '6 Months', value: '6months' },
  { label: 'Yearly', value: 'yearly' },
  { label: 'Custom', value: 'custom' },
];

export function ReportsPage() {
  const { can } = useAuth();
  const [preset, setPreset] = useState<DateRangePreset>('monthly');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const dateRange = useMemo(() => getDateRange(preset, customStart, customEnd), [preset, customStart, customEnd]);
  
  const { data: metrics, isLoading: metricsLoading } = useReportMetrics(dateRange);
  const { data: breakdown, isLoading: chartLoading } = useDailyBreakdown(dateRange);

  // Calculate max revenue for chart scaling
  const maxRevenue = useMemo(() => Math.max(...(breakdown?.map((d) => d.revenue) || [1])), [breakdown]);

  if (!can('reports', 'view')) {
    return (
      <Card className="flex flex-col items-center p-12 text-center">
        <BarChart3 className="text-muted-foreground" size={40} />
        <h1 className="mt-4 text-xl font-bold">No permission</h1>
        <p className="mt-2 text-sm text-muted-foreground">Your role does not allow viewing reports.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground">Analyze performance over custom time periods.</p>
        </div>
        
        {/* Date Range Selector */}
        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-1">
          {presets.map((p) => (
            <button
              key={p.value}
              onClick={() => setPreset(p.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                preset === p.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Inputs (Only show if Custom is selected) */}
      {preset === 'custom' && (
        <Card className="flex items-center gap-4">
          <Calendar size={18} className="text-muted-foreground" />
          <div className="flex flex-1 gap-4">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Start Date</label>
              <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">End Date</label>
              <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
          </div>
        </Card>
      )}

      {/* KPI Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
            <DollarSign className="text-green-600" size={18} />
          </div>
          <p className="mt-2 text-2xl font-bold">{metricsLoading ? '...' : formatCurrency(metrics?.totalRevenue ?? 0)}</p>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
            <ShoppingCart className="text-blue-600" size={18} />
          </div>
          <p className="mt-2 text-2xl font-bold">{metricsLoading ? '...' : metrics?.totalOrders.toLocaleString()}</p>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Avg Order Value</p>
            <TrendingUp className="text-purple-600" size={18} />
          </div>
          <p className="mt-2 text-2xl font-bold">{metricsLoading ? '...' : formatCurrency(metrics?.averageOrderValue ?? 0)}</p>
        </Card>
        <Card className="bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-primary">Net Profit</p>
            <DollarSign className="text-primary" size={18} />
          </div>
          <p className="mt-2 text-2xl font-bold text-primary">{metricsLoading ? '...' : formatCurrency(metrics?.netProfit ?? 0)}</p>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <h2 className="mb-4 font-semibold">Daily Revenue Breakdown</h2>
        {chartLoading ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">Loading chart data...</div>
        ) : breakdown && breakdown.length > 0 ? (
          <div className="flex h-64 items-end gap-1 border-b pb-2">
            {breakdown.map((day) => {
              const heightPercent = (day.revenue / maxRevenue) * 100;
              return (
                <div key={day.date} className="group relative flex flex-1 flex-col items-center justify-end h-full">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 hidden rounded bg-slate-900 px-2 py-1 text-xs text-white group-hover:block whitespace-nowrap z-10">
                    {day.date}: {formatCurrency(day.revenue)}
                  </div>
                  {/* Bar */}
                  <div 
                    className="w-full max-w-[20px] rounded-t bg-primary/80 hover:bg-primary transition-all" 
                    style={{ height: `${heightPercent}%` }} 
                  />
                  {/* X-Axis Label (Show only every 5th day to avoid clutter) */}
                  <span className="mt-2 text-[10px] text-muted-foreground hidden sm:block">
                    {breakdown.indexOf(day) % 5 === 0 ? day.date.slice(5) : ''}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center text-muted-foreground">No data available for this date range.</div>
        )}
      </Card>
    </div>
  );
}