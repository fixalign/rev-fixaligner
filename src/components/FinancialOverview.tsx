import { DashboardStats } from "@/types";
import { formatCurrency, formatPercentage } from "@/lib/calculations";

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: "positive" | "negative" | "neutral";
}

function StatsCard({
  title,
  value,
  subtitle,
  trend = "neutral",
}: StatsCardProps) {
  const trendColors = {
    positive: "text-green-600",
    negative: "text-red-600",
    neutral: "text-gray-600",
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
      <p className={`text-3xl font-bold ${trendColors[trend]}`}>{value}</p>
      {subtitle && <p className="text-sm text-gray-600 mt-2">{subtitle}</p>}
    </div>
  );
}

interface FinancialOverviewProps {
  stats: DashboardStats;
}

export default function FinancialOverview({ stats }: FinancialOverviewProps) {
  const profitTrend =
    stats.netProfit > 0
      ? "positive"
      : stats.netProfit < 0
      ? "negative"
      : "neutral";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Financial Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            subtitle={`Avg: ${formatCurrency(
              stats.averageRevenuePerPatient
            )}/patient`}
            trend="positive"
          />
          <StatsCard
            title="Total Costs"
            value={formatCurrency(stats.totalCosts)}
            subtitle={`Avg: ${formatCurrency(
              stats.averageCostPerPatient
            )}/patient`}
            trend="neutral"
          />
          <StatsCard
            title="Net Profit"
            value={formatCurrency(stats.netProfit)}
            subtitle={`Margin: ${formatPercentage(stats.profitMargin)}`}
            trend={profitTrend}
          />
          <StatsCard
            title="Payments Remaining"
            value={formatCurrency(stats.paymentsRemaining)}
            subtitle={`${stats.activePatients} active patients`}
            trend="neutral"
          />
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Patient Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Total Patients"
            value={stats.totalPatients.toString()}
            trend="neutral"
          />
          <StatsCard
            title="Active Treatments"
            value={stats.activePatients.toString()}
            trend="positive"
          />
          <StatsCard
            title="Completed Treatments"
            value={stats.completedPatients.toString()}
            trend="positive"
          />
        </div>
      </div>
    </div>
  );
}
