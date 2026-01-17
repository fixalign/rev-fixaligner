import { FixedCosts } from "@/types";
import { formatCurrency } from "@/lib/calculations";
import { useState } from "react";

export interface VariableRates {
  sheetRate: number;
  caseRate: number;
  resinRate: number;
  bagRate: number;
  boxRate: number;
}

export interface DirectRates {
  designRate: number;
  alcoholRate: number;
  tissuesRate: number;
  toolsRate: number;
  marketingFeeRate: number;
}

export interface YearlyRates {
  [year: number]: {
    variable: VariableRates;
    direct: DirectRates;
    fixed: FixedCosts;
  };
}

interface CostSettingsProps {
  selectedYear: number | "all";
  onYearChange: (year: number | "all") => void;
  yearlyRates: YearlyRates;
  onYearlyRatesChange: (yearlyRates: YearlyRates) => void;
  availableYears: number[];
}

export default function CostSettings({
  selectedYear,
  onYearChange,
  yearlyRates,
  onYearlyRatesChange,
  availableYears,
}: CostSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingYear, setEditingYear] = useState<number>(
    availableYears[0] || 2024
  );

  // If a specific year is selected for filtering, use that year for editing
  // Otherwise, use the editingYear state
  const activeEditingYear = selectedYear === "all" ? editingYear : selectedYear;

  const currentRates = yearlyRates[activeEditingYear] || {
    variable: {
      sheetRate: 8,
      caseRate: 45,
      resinRate: 120,
      bagRate: 0.5,
      boxRate: 15,
    },
    direct: { designRate: 150, alcoholRate: 10, tissuesRate: 5, toolsRate: 20, marketingFeeRate: 7 },
    fixed: {
      rent: 2000,
      utilities: 300,
      salaries: 5000,
      internet: 100,
      legal: 500,
      accountant_and_audit: 1000,
      cmo: 5000,
      monthlyCapacityHours: 192,
      totalFixedCost: 14000,
    },
  };

  const updateYearRates = (
    year: number,
    category: "variable" | "direct" | "fixed",
    field: string,
    value: number
  ) => {
    const newYearlyRates = { ...yearlyRates };
    if (!newYearlyRates[year]) {
      newYearlyRates[year] = {
        variable: {
          sheetRate: 8,
          caseRate: 45,
          resinRate: 120,
          bagRate: 0.5,
          boxRate: 15,
        },
        direct: {
          designRate: 150,
          alcoholRate: 10,
          tissuesRate: 5,
          toolsRate: 20,
          marketingFeeRate: 7,
        },
        fixed: {
          rent: 2000,
          utilities: 300,
          salaries: 5000,
          internet: 100,
          legal: 500,
          accountant_and_audit: 1000,
          cmo: 5000,
          monthlyCapacityHours: 192,
          totalFixedCost: 14000,
        },
      };
    }

    if (category === "fixed" && field !== "totalFixedCost") {
      const updatedFixed = { ...newYearlyRates[year].fixed, [field]: value };
      updatedFixed.totalFixedCost =
        updatedFixed.rent +
        updatedFixed.utilities +
        updatedFixed.salaries +
        updatedFixed.internet +
        updatedFixed.legal +
        updatedFixed.accountant_and_audit +
        updatedFixed.cmo;
      newYearlyRates[year] = { ...newYearlyRates[year], fixed: updatedFixed };
    } else {
      newYearlyRates[year] = {
        ...newYearlyRates[year],
        [category]: { ...newYearlyRates[year][category], [field]: value },
      };
    }

    onYearlyRatesChange(newYearlyRates);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚙️</span>
          <div className="text-left">
            <h2 className="text-xl font-bold text-gray-900">Cost Settings</h2>
            <p className="text-sm text-gray-600">
              Adjust rates by year and view filtered data
            </p>
          </div>
        </div>
        <span className="text-2xl text-gray-400">{isExpanded ? "▼" : "▶"}</span>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-6 border-t">
          {/* Year Selection */}
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Filter by Year
            </h3>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => onYearChange("all")}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${selectedYear === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                All Years
              </button>
              {availableYears.map((year) => (
                <button
                  key={year}
                  onClick={() => onYearChange(year)}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${selectedYear === year
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>

          {/* Year-specific Rate Editor - Only show when "All Years" is selected */}
          {selectedYear === "all" && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Edit Rates for Year
              </h3>
              <div className="flex gap-2 mb-4">
                {availableYears.map((year) => (
                  <button
                    key={year}
                    onClick={() => setEditingYear(year)}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${editingYear === year
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Editing rates for{" "}
                <span className="font-semibold">{editingYear}</span>
              </p>
            </div>
          )}

          {/* Fixed Costs */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Fixed Costs (Monthly) - {activeEditingYear}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rent
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    value={currentRates.fixed.rent ?? ""}
                    onChange={(e) =>
                      updateYearRates(
                        activeEditingYear,
                        "fixed",
                        "rent",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Utilities
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    value={currentRates.fixed.utilities ?? ""}
                    onChange={(e) =>
                      updateYearRates(
                        activeEditingYear,
                        "fixed",
                        "utilities",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salaries
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    value={currentRates.fixed.salaries ?? ""}
                    onChange={(e) =>
                      updateYearRates(
                        activeEditingYear,
                        "fixed",
                        "salaries",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Internet
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    value={currentRates.fixed.internet ?? ""}
                    onChange={(e) =>
                      updateYearRates(
                        activeEditingYear,
                        "fixed",
                        "internet",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Legal
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    value={currentRates.fixed.legal ?? ""}
                    onChange={(e) =>
                      updateYearRates(
                        activeEditingYear,
                        "fixed",
                        "legal",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Accountant & Audit
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    value={currentRates.fixed.accountant_and_audit ?? ""}
                    onChange={(e) =>
                      updateYearRates(
                        activeEditingYear,
                        "fixed",
                        "accountant_and_audit",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CMO + Marketing
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    value={currentRates.fixed.cmo ?? ""}
                    onChange={(e) =>
                      updateYearRates(
                        activeEditingYear,
                        "fixed",
                        "cmo",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Capacity (Hours)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">
                    ⏱️
                  </span>
                  <input
                    type="number"
                    value={currentRates.fixed.monthlyCapacityHours ?? ""}
                    onChange={(e) =>
                      updateYearRates(
                        activeEditingYear,
                        "fixed",
                        "monthlyCapacityHours",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">
                  Total Fixed Costs:
                </span>
                <span className="text-lg font-bold text-blue-600">
                  {formatCurrency(currentRates.fixed.totalFixedCost)}
                </span>
              </div>
            </div>
          </div>

          {/* Variable Costs Rates */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Variable Cost Rates - {activeEditingYear}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sheet Rate (per sheet)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={currentRates.variable.sheetRate ?? ""}
                    onChange={(e) =>
                      updateYearRates(
                        activeEditingYear,
                        "variable",
                        "sheetRate",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Case & Accessories Rate
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={currentRates.variable.caseRate ?? ""}
                    onChange={(e) =>
                      updateYearRates(
                        activeEditingYear,
                        "variable",
                        "caseRate",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resin Rate (per liter)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={currentRates.variable.resinRate ?? ""}
                    onChange={(e) =>
                      updateYearRates(
                        activeEditingYear,
                        "variable",
                        "resinRate",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bag Rate (per bag)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={currentRates.variable.bagRate ?? ""}
                    onChange={(e) =>
                      updateYearRates(
                        activeEditingYear,
                        "variable",
                        "bagRate",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Packaging Box Rate
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={currentRates.variable.boxRate ?? ""}
                    onChange={(e) =>
                      updateYearRates(
                        activeEditingYear,
                        "variable",
                        "boxRate",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Design Rate (per design)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={currentRates.direct.designRate ?? ""}
                    onChange={(e) =>
                      updateYearRates(
                        activeEditingYear,
                        "direct",
                        "designRate",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alcohol (per treatment)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={currentRates.direct.alcoholRate ?? ""}
                    onChange={(e) =>
                      updateYearRates(
                        activeEditingYear,
                        "direct",
                        "alcoholRate",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tissues (per treatment)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={currentRates.direct.tissuesRate ?? ""}
                    onChange={(e) =>
                      updateYearRates(
                        activeEditingYear,
                        "direct",
                        "tissuesRate",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Production Tools (per treatment)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={currentRates.direct.toolsRate ?? ""}
                    onChange={(e) =>
                      updateYearRates(
                        activeEditingYear,
                        "direct",
                        "toolsRate",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marketing Fee Rate (%)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">
                    %
                  </span>
                  <input
                    type="number"
                    step="0.1"
                    value={currentRates.direct.marketingFeeRate ?? ""}
                    onChange={(e) =>
                      updateYearRates(
                        activeEditingYear,
                        "direct",
                        "marketingFeeRate",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Calculation Formulas
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="font-semibold text-gray-700 min-w-[120px]">
                  Sheets:
                </span>
                <span className="text-gray-600 font-mono">
                  numberOfSteps × 2 + 4
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-gray-700 min-w-[120px]">
                  Resin (liters):
                </span>
                <span className="text-gray-600 font-mono">
                  (0.8 / 22) × (numberOfSteps + 2)
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-gray-700 min-w-[120px]">
                  Execution Time:
                </span>
                <span className="text-gray-600 font-mono">
                  numberOfSteps × 0.15 (9 mins/step)
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600">
              💡 Set different rates for each year. When viewing &quot;All
              Years&quot;, each treatment uses its year&apos;s rates. Filter by
              year to see year-specific results.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
