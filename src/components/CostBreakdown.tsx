import { TreatmentRecord } from "@/types";
import { formatCurrency } from "@/lib/calculations";

interface CostBreakdownProps {
  treatment: TreatmentRecord;
}

export default function CostBreakdown({ treatment }: CostBreakdownProps) {
  const treatmentYear = new Date(treatment.treatmentStarted).getFullYear();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        Cost Breakdown: {treatment.name}
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Calculated using {treatmentYear} rates
      </p>

      <div className="space-y-6">
        {/* Variable Costs */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-3">
            Variable Costs
          </h4>
          <div className="space-y-2 pl-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Sheets ({treatment.variableCosts.sheets.quantity} ×{" "}
                {formatCurrency(treatment.variableCosts.sheets.ratePerSheet)})
              </span>
              <span className="font-medium text-gray-900">
                {formatCurrency(treatment.variableCosts.sheets.totalCost)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Case + Accessories (
                {treatment.variableCosts.caseAndAccessories.quantity} ×{" "}
                {formatCurrency(
                  treatment.variableCosts.caseAndAccessories.ratePerCase
                )}
                )
              </span>
              <span className="font-medium text-gray-900">
                {formatCurrency(
                  treatment.variableCosts.caseAndAccessories.totalCost
                )}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Resin ({treatment.variableCosts.resin.quantity?.toFixed(2)}L ×{" "}
                {formatCurrency(treatment.variableCosts.resin.ratePerLiter)})
              </span>
              <span className="font-medium text-gray-900">
                {formatCurrency(treatment.variableCosts.resin.totalCost)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Bags ({treatment.variableCosts.bag.quantity} ×{" "}
                {formatCurrency(treatment.variableCosts.bag.ratePerBag)})
              </span>
              <span className="font-medium text-gray-900">
                {formatCurrency(treatment.variableCosts.bag.totalCost)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Packaging ({treatment.variableCosts.packagingBox.quantity} ×{" "}
                {formatCurrency(
                  treatment.variableCosts.packagingBox.ratePerBox
                )}
                )
              </span>
              <span className="font-medium text-gray-900">
                {formatCurrency(treatment.variableCosts.packagingBox.totalCost)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Design ({treatment.directCosts.design.quantity} ×{" "}
                {formatCurrency(treatment.directCosts.design.ratePerDesign)})
              </span>
              <span className="font-medium text-gray-900">
                {formatCurrency(treatment.directCosts.design.totalCost)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Alcohol</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(treatment.directCosts.alcohol.totalCost)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tissues</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(treatment.directCosts.tissues.totalCost)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Production Tools</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(
                  treatment.directCosts.productionTools.totalCost
                )}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Marketing Fee ({treatment.directCosts.marketingFee.rate}%)
              </span>
              <span className="font-medium text-gray-900">
                {formatCurrency(treatment.directCosts.marketingFee.totalCost)}
              </span>
            </div>
            <div className="flex justify-between text-sm font-semibold pt-2 border-t">
              <span className="text-gray-800">Total Variable Costs</span>
              <span className="text-red-600">
                {formatCurrency(
                  treatment.variableCosts.totalVariableCost +
                  treatment.directCosts.totalDirectCost
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Fixed Costs (Allocated) */}
        {treatment.allocatedFixedCost !== undefined && (
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-3">
              Fixed Costs (Allocated)
            </h4>
            <div className="space-y-2 pl-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Execution Time
                </span>
                <span className="font-medium text-gray-900">
                  {treatment.estimatedHours?.toFixed(2)} Hours
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Fixed Cost Share (Monthly Balanced)
                </span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(treatment.monthlyFixedAllocation)}
                </span>
              </div>
              <div className="flex justify-between text-sm italic">
                <span className="text-gray-500">
                  Unallocated burden remaining
                </span>
                <span className="font-medium text-gray-500">
                  {formatCurrency(treatment.remainingOverhead)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="pt-4 border-t-2 border-gray-300">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-900">
                Treatment Price
              </span>
              <span className="font-bold text-green-600">
                {formatCurrency(treatment.price)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-900">
                Variable Costs
              </span>
              <span className="font-bold text-red-600">
                -
                {formatCurrency(
                  treatment.variableCosts.totalVariableCost +
                  treatment.directCosts.totalDirectCost
                )}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="font-bold text-gray-900">Gross Profit</span>
              <span
                className={`font-bold ${treatment.price -
                  (treatment.variableCosts.totalVariableCost +
                    treatment.directCosts.totalDirectCost) >=
                  0
                  ? "text-green-600"
                  : "text-red-600"
                  }`}
              >
                {formatCurrency(
                  treatment.price -
                  (treatment.variableCosts.totalVariableCost +
                    treatment.directCosts.totalDirectCost)
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-900">Fixed Costs</span>
              <span className="font-bold text-red-600">
                -{formatCurrency(treatment.monthlyFixedAllocation)}
              </span>
            </div>
            <div className="flex justify-between text-lg pt-2 border-t">
              <div className="flex flex-col">
                <span className="font-bold text-gray-900">Operational Profit</span>
                <span className="text-xs text-gray-500 italic">
                  Profit after variable + balanced fixed cost share
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className={`font-bold ${treatment.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(treatment.profit)}
                </span>
                <span className="text-xs text-gray-500">
                  {formatCurrency(treatment.profitPerHour)}/hour
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
