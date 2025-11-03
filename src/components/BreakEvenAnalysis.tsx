import { FinancialSummary } from "@/types";
import { formatCurrency, formatPercentage } from "@/lib/calculations";

interface BreakEvenAnalysisProps {
  summary: FinancialSummary;
}

export default function BreakEvenAnalysis({ summary }: BreakEvenAnalysisProps) {
  const currentTreatments =
    summary.treatmentsPerYear.year2024 + summary.treatmentsPerYear.year2025;
  const treatmentsNeeded = Math.max(
    0,
    summary.breakEvenPoint - currentTreatments
  );
  const isBreakEven = currentTreatments >= summary.breakEvenPoint;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Break-Even Analysis
      </h2>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Break-Even Point
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              {summary.breakEvenPoint}
            </p>
            <p className="text-sm text-gray-600 mt-1">treatments needed</p>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Current Treatments
            </h3>
            <p className="text-3xl font-bold text-purple-600">
              {currentTreatments}
            </p>
            <p className="text-sm text-gray-600 mt-1">total completed</p>
          </div>
        </div>

        <div
          className={`p-6 rounded-lg ${
            isBreakEven ? "bg-green-50" : "bg-yellow-50"
          } text-gray-700`}
        >
          <h3 className="text-lg font-semibold mb-2">
            {isBreakEven ? "✓ Break-Even Achieved!" : "⚠ Not Yet Break-Even"}
          </h3>
          <p className="text-gray-700">
            {isBreakEven
              ? `You've surpassed the break-even point by ${
                  currentTreatments - summary.breakEvenPoint
                } treatments.`
              : `You need ${treatmentsNeeded} more treatment${
                  treatmentsNeeded !== 1 ? "s" : ""
                } to reach break-even.`}
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
                className={`font-bold text-lg ${
                  summary.grossProfit >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatCurrency(summary.grossProfit)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Gross Margin</span>
              <span
                className={`font-bold ${
                  summary.grossProfit / summary.totalRevenue >= 0
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
                Operational Profit
              </span>
              <span
                className={`font-bold text-lg ${
                  summary.netProfit >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatCurrency(summary.netProfit)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">
                Operational Margin
              </span>
              <span
                className={`font-bold ${
                  summary.profitMargin >= 0 ? "text-green-600" : "text-red-600"
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
