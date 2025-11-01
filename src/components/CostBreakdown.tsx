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
                Resin ({treatment.variableCosts.resin.quantity}L ×{" "}
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
                  Allocated portion of overhead costs
                </span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(treatment.allocatedFixedCost)}
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
              <span className="font-semibold text-gray-900">Total Costs</span>
              <span className="font-bold text-red-600">
                {formatCurrency(treatment.totalCost)}
              </span>
            </div>
            <div className="flex justify-between text-lg pt-2 border-t">
              <span className="font-bold text-gray-900">Profit</span>
              <span
                className={`font-bold ${
                  treatment.profit >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatCurrency(treatment.profit)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
