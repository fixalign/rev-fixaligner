import { FinancialSummary } from "@/types";
import { formatCurrency, formatPercentage } from "@/lib/calculations";

interface BreakEvenAnalysisProps {
  summary: FinancialSummary;
}

export default function BreakEvenAnalysis({ summary }: BreakEvenAnalysisProps) {
  const currentTreatments = Object.values(summary.treatmentsPerYear).reduce((a, b) => a + b, 0);
  const treatmentsNeeded = Math.max(
    0,
    summary.breakEvenPoint - currentTreatments
  );
  const isBreakEven = currentTreatments >= summary.breakEvenPoint;

  const avgRevenue = summary.totalPatients > 0 ? summary.totalRevenue / summary.totalPatients : 0;
  const avgVarCosts = summary.totalPatients > 0 ? (summary.totalVariableCosts + summary.totalDirectCosts) / summary.totalPatients : 0;
  const contributionMargin = avgRevenue - avgVarCosts;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Break-Even Analysis
      </h2>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Monthly Target
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {summary.monthlyBreakEven}
            </p>
            <p className="text-sm text-gray-600 mt-1">treatments / month</p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Cumulative Break-Even
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              {summary.breakEvenPoint}
            </p>
            <p className="text-sm text-gray-600 mt-1">total needed</p>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Current Treatments
            </h3>
            <p className="text-3xl font-bold text-purple-600">
              {currentTreatments}
            </p>
            <p className="text-sm text-gray-600 mt-1">total for period</p>
          </div>
        </div>

        <div
          className={`p-6 rounded-lg ${contributionMargin <= 0 ? "bg-red-50" : isBreakEven ? "bg-green-50" : "bg-yellow-50"
            } text-gray-700`}
        >
          <h3 className="text-lg font-semibold mb-2">
            {contributionMargin <= 0
              ? "⚠ Profitability Error"
              : isBreakEven ? "✓ Break-Even Achieved!" : "⚠ Not Yet Break-Even"}
          </h3>
          <p className="text-gray-700">
            {contributionMargin <= 0
              ? "Your average costs per patient are higher than your revenue. You cannot reach break-even with these rates."
              : isBreakEven
                ? `You've surpassed the break-even point by ${currentTreatments - summary.breakEvenPoint
                } treatments.`
                : `You need ${treatmentsNeeded} more treatment${treatmentsNeeded !== 1 ? "s" : ""
                } to reach break-even for this period.`}
          </p>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Cost Breakdown
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Revenue</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(summary.totalRevenue)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Variable Costs</span>
              <span className="font-semibold text-red-600">
                -
                {formatCurrency(
                  summary.totalVariableCosts + summary.totalDirectCosts
                )}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Fixed Costs</span>
              <span className="font-semibold text-red-600">
                -{formatCurrency(summary.totalFixedCosts)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t-2 border-gray-300">
              <span className="font-semibold text-gray-900">Gross Profit</span>
              <span
                className={`font-bold text-lg ${summary.grossProfit >= 0 ? "text-green-600" : "text-red-600"
                  }`}
              >
                {formatCurrency(summary.grossProfit)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Gross Margin</span>
              <span
                className={`font-bold ${summary.grossProfit / summary.totalRevenue >= 0
                  ? "text-green-600"
                  : "text-red-600"
                  }`}
              >
                {formatPercentage(
                  (summary.grossProfit / summary.totalRevenue) * 100
                )}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t">
              <span className="font-semibold text-gray-900">
                Net Profit (Total)
              </span>
              <span
                className={`font-bold text-lg ${summary.netProfit >= 0 ? "text-green-600" : "text-red-600"
                  }`}
              >
                {formatCurrency(summary.netProfit)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">
                Net Margin
              </span>
              <span
                className={`font-bold ${summary.profitMargin >= 0 ? "text-green-600" : "text-red-600"
                  }`}
              >
                {formatPercentage(summary.profitMargin)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
