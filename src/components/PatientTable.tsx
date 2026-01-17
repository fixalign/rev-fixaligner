import React from "react";
import { TreatmentRecord } from "@/types";
import { formatCurrency, formatPercentage } from "@/lib/calculations";

interface PatientTableProps {
  treatments: TreatmentRecord[];
  onPatientClick?: (patientId: string) => void;
}

export default function PatientTable({
  treatments,
  onPatientClick,
}: PatientTableProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Patient Treatments</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Clinic
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Steps
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hours
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Variable Cost
              </th>
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Overhead Share
              </th> */}
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Burden
              </th> */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fixed Cost/Treatment
              </th>
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Cost
              </th> */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Profit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gross Margin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Operational Margin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment Due
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(
              treatments.reduce((acc, treatment) => {
                // We prioritize timerDeliveryEndedAt. The API filters out nulls, so it should be present.
                // Fallback to treatmentStarted just in case of simulation/mock data mismatch.
                const date = treatment.timerDeliveryEndedAt || treatment.treatmentStarted;
                const dateObj = new Date(date);

                const monthYear = dateObj.toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                });
                if (!acc[monthYear]) acc[monthYear] = [];
                acc[monthYear].push(treatment);
                return acc;
              }, {} as Record<string, TreatmentRecord[]>)
            )
              .sort(([a], [b]) => {
                const dateA = new Date(a);
                const dateB = new Date(b);
                return dateB.getTime() - dateA.getTime();
              })
              .map(([monthYear, group]) => (
                <React.Fragment key={monthYear}>
                  {/* Month Group Header */}
                  <tr className="bg-gray-100">
                    <td
                      colSpan={10}
                      className="px-6 py-2 whitespace-nowrap text-sm font-bold text-gray-700 uppercase tracking-wider"
                    >
                      {monthYear}
                    </td>
                  </tr>
                  {group.map((treatment) => (
                    <tr
                      key={treatment.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => onPatientClick?.(treatment.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {treatment.name}
                        </div>
                        <div className="text-sm text-gray-500">{treatment.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {treatment.clinicName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{treatment.numberOfSteps}</div>
                        {treatment.refinement && (
                          <div className="text-xs text-blue-600">
                            (+{treatment.refinementSteps}R)
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {treatment.estimatedHours?.toFixed(2)}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(treatment.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        {formatCurrency(
                          treatment.variableCosts.totalVariableCost +
                          treatment.directCosts.totalDirectCost
                        )}
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                      {formatCurrency(treatment.allocatedFixedCost)}
                    </td> */}
                      {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 italic">
                      {formatCurrency(treatment.remainingOverhead)}
                    </td> */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        {formatCurrency(treatment.monthlyFixedAllocation)}
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                       {formatCurrency(treatment.totalCost)}
                    </td> */}
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${treatment.profit >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                      >
                        {formatCurrency(treatment.profit)}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm ${(treatment.price -
                          (treatment.variableCosts.totalVariableCost +
                            treatment.directCosts.totalDirectCost)) /
                          treatment.price >=
                          0
                          ? "text-gray-900"
                          : "text-red-600"
                          }`}
                      >
                        {formatPercentage(
                          ((treatment.price -
                            (treatment.variableCosts.totalVariableCost +
                              treatment.directCosts.totalDirectCost)) /
                            treatment.price) *
                          100
                        )}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm ${treatment.profitMargin >= 0
                          ? "text-gray-900"
                          : "text-red-600"
                          }`}
                      >
                        {formatPercentage(treatment.profitMargin)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {treatment.paymentRemaining > 0 ? (
                          <span className="text-orange-600 font-medium">
                            {formatCurrency(treatment.paymentRemaining)}
                          </span>
                        ) : (
                          <span className="text-green-600">Paid</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
          </tbody>
        </table>
      </div>
    </div >
  );
}
