"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { YearlyRates } from "@/components/CostSettings";

export default function ConstantsPage() {
  const [yearlyRates, setYearlyRates] = useState<YearlyRates>({});
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [newYearInput, setNewYearInput] = useState("");

  // Fetch cost rates from database
  useEffect(() => {
    fetchCostRates();
  }, []);

  const fetchCostRates = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/cost-rates");
      const result = await response.json();

      if (result.success) {
        setYearlyRates(result.data);
      } else {
        setMessage({ type: "error", text: "Failed to load cost rates" });
      }
    } catch (error) {
      console.error("Error fetching cost rates:", error);
      setMessage({ type: "error", text: "Failed to load cost rates" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const ratesForYear = yearlyRates[selectedYear];

      if (!ratesForYear) {
        setMessage({ type: "error", text: "No rates found for this year" });
        return;
      }

      const response = await fetch("/api/cost-rates/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          year: selectedYear,
          variable: ratesForYear.variable,
          direct: ratesForYear.direct,
          fixed: ratesForYear.fixed,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: "success", text: "Cost rates saved successfully!" });
        // Refresh data
        await fetchCostRates();
      } else {
        setMessage({ type: "error", text: result.error || "Failed to save" });
      }
    } catch (error) {
      console.error("Error saving cost rates:", error);
      setMessage({ type: "error", text: "Failed to save cost rates" });
    } finally {
      setSaving(false);
    }
  };

  const handleAddYear = () => {
    // Determine which year to add
    let yearToAdd: number;

    if (newYearInput && newYearInput.trim() !== "") {
      yearToAdd = parseInt(newYearInput.trim());
    } else {
      const existingYears = Object.keys(yearlyRates).map(Number);
      yearToAdd =
        existingYears.length > 0
          ? Math.max(...existingYears) + 1
          : new Date().getFullYear();
    }

    if (isNaN(yearToAdd) || yearToAdd < 1900 || yearToAdd > 2200) {
      setMessage({
        type: "error",
        text: "Please enter a valid year between 1900 and 2200",
      });
      return;
    }

    if (yearlyRates[yearToAdd]) {
      setMessage({ type: "error", text: `Year ${yearToAdd} already exists` });
      setNewYearInput("");
      return;
    }

    const previousYear = yearToAdd - 1;
    const previousRates = yearlyRates[previousYear] || {
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
      },
      fixed: {
        rent: 5000,
        utilities: 800,
        salaries: 15000,
        internet: 200,
        legal: 500,
        accountant_and_audit: 1000,
        cmo: 5000,
        monthlyCapacityHours: 192,
        totalFixedCost: 24500,
      },
    };

    setYearlyRates({
      ...yearlyRates,
      [yearToAdd]: previousRates,
    });
    setSelectedYear(yearToAdd);
    setNewYearInput("");
    setMessage({
      type: "success",
      text: `Year ${yearToAdd} added successfully!`,
    });
  };

  const updateRate = (
    category: "variable" | "direct" | "fixed",
    field: string,
    value: number
  ) => {
    setYearlyRates((prev) => {
      const currentRates = prev[selectedYear] || {
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
        },
        fixed: {
          rent: 5000,
          utilities: 800,
          salaries: 15000,
          internet: 200,
          legal: 500,
          accountant_and_audit: 1000,
          cmo: 5000,
          monthlyCapacityHours: 192,
          totalFixedCost: 24500,
        },
      };

      const updated = {
        ...currentRates,
        [category]: {
          ...currentRates[category],
          [field]: value,
        },
      };

      // Recalculate totalFixedCost if fixed category
      if (category === "fixed") {
        updated.fixed.totalFixedCost =
          updated.fixed.rent +
          updated.fixed.utilities +
          updated.fixed.salaries +
          updated.fixed.internet +
          updated.fixed.legal +
          updated.fixed.accountant_and_audit +
          updated.fixed.cmo;
      }

      return {
        ...prev,
        [selectedYear]: updated,
      };
    });
  };

  const currentRates = yearlyRates[selectedYear];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Image src="/logo.svg" alt="Logo" width={48} height={48} />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Cost Constants Management
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Manage yearly cost rates for calculations
                </p>
              </div>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Message Display */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
                }`}
            >
              <div className="flex items-center">
                <span className="text-lg mr-2">
                  {message.type === "success" ? "✓" : "⚠"}
                </span>
                {message.text}
              </div>
            </div>
          )}

          {/* Year Management Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Year Management
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Select Existing Year */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="mr-2">📅</span>
                  Select Existing Year
                </h3>
                <select
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(Number(e.target.value));
                    setMessage(null);
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-md text-gray-900 bg-white font-medium text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                >
                  {Object.keys(yearlyRates)
                    .sort((a, b) => Number(b) - Number(a))
                    .map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  Modify rates below and click Save Changes
                </p>
              </div>

              {/* Add New Year */}
              <div className="border border-gray-200 rounded-lg p-4 bg-green-50">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="mr-2">➕</span>
                  Add New Year
                </h3>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Enter year (e.g. 2024)"
                    value={newYearInput}
                    onChange={(e) => setNewYearInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleAddYear();
                      }
                    }}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-md text-gray-900 bg-white font-medium focus:border-green-500 focus:ring-2 focus:ring-green-200 transition"
                    min="1900"
                    max="2200"
                  />
                  <button
                    onClick={handleAddYear}
                    className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium shadow-sm hover:shadow-md transition whitespace-nowrap"
                  >
                    Add Year
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  {newYearInput
                    ? `Will create ${newYearInput} with default rates`
                    : "Leave empty to add next year automatically"}
                </p>
              </div>
            </div>
          </div>

          {currentRates && (
            <div className="space-y-6">
              {/* Variable Costs */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center mb-6">
                  <span className="text-2xl mr-3">📦</span>
                  <h2 className="text-xl font-bold text-gray-900">
                    Variable Costs (Per Treatment)
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Sheet Rate
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        value={currentRates.variable.sheetRate}
                        onChange={(e) =>
                          updateRate(
                            "variable",
                            "sheetRate",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full pl-8 pr-3 py-3 border-2 border-gray-300 rounded-md text-gray-900 bg-white font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Case Rate
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        value={currentRates.variable.caseRate}
                        onChange={(e) =>
                          updateRate(
                            "variable",
                            "caseRate",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full pl-8 pr-3 py-3 border-2 border-gray-300 rounded-md text-gray-900 bg-white font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Resin Rate (per Liter)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        value={currentRates.variable.resinRate}
                        onChange={(e) =>
                          updateRate(
                            "variable",
                            "resinRate",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full pl-8 pr-3 py-3 border-2 border-gray-300 rounded-md text-gray-900 bg-white font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Bag Rate
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        value={currentRates.variable.bagRate}
                        onChange={(e) =>
                          updateRate(
                            "variable",
                            "bagRate",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full pl-8 pr-3 py-3 border-2 border-gray-300 rounded-md text-gray-900 bg-white font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Box Rate
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        value={currentRates.variable.boxRate}
                        onChange={(e) =>
                          updateRate(
                            "variable",
                            "boxRate",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full pl-8 pr-3 py-3 border-2 border-gray-300 rounded-md text-gray-900 bg-white font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Design Rate
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        value={currentRates.direct.designRate}
                        onChange={(e) =>
                          updateRate(
                            "direct",
                            "designRate",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full pl-8 pr-3 py-3 border-2 border-gray-300 rounded-md text-gray-900 bg-white font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Alcohol Rate
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        value={currentRates.direct.alcoholRate}
                        onChange={(e) =>
                          updateRate(
                            "direct",
                            "alcoholRate",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full pl-8 pr-3 py-3 border-2 border-gray-300 rounded-md text-gray-900 bg-white font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tissues Rate
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        value={currentRates.direct.tissuesRate}
                        onChange={(e) =>
                          updateRate(
                            "direct",
                            "tissuesRate",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full pl-8 pr-3 py-3 border-2 border-gray-300 rounded-md text-gray-900 bg-white font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tools Rate
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        value={currentRates.direct.toolsRate}
                        onChange={(e) =>
                          updateRate(
                            "direct",
                            "toolsRate",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full pl-8 pr-3 py-3 border-2 border-gray-300 rounded-md text-gray-900 bg-white font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Fixed Costs */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center mb-6">
                  <span className="text-2xl mr-3">🏢</span>
                  <h2 className="text-xl font-bold text-gray-900">
                    Fixed Costs (Monthly)
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Rent
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        value={currentRates.fixed.rent}
                        onChange={(e) =>
                          updateRate(
                            "fixed",
                            "rent",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full pl-8 pr-3 py-3 border-2 border-gray-300 rounded-md text-gray-900 bg-white font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Utilities
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        value={currentRates.fixed.utilities}
                        onChange={(e) =>
                          updateRate(
                            "fixed",
                            "utilities",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full pl-8 pr-3 py-3 border-2 border-gray-300 rounded-md text-gray-900 bg-white font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Salaries
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        value={currentRates.fixed.salaries}
                        onChange={(e) =>
                          updateRate(
                            "fixed",
                            "salaries",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full pl-8 pr-3 py-3 border-2 border-gray-300 rounded-md text-gray-900 bg-white font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Internet
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        value={currentRates.fixed.internet}
                        onChange={(e) =>
                          updateRate(
                            "fixed",
                            "internet",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full pl-8 pr-3 py-3 border-2 border-gray-300 rounded-md text-gray-900 bg-white font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Legal
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        value={currentRates.fixed.legal}
                        onChange={(e) =>
                          updateRate(
                            "fixed",
                            "legal",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full pl-8 pr-3 py-3 border-2 border-gray-300 rounded-md text-gray-900 bg-white font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Accountant & Audit
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        value={currentRates.fixed.accountant_and_audit}
                        onChange={(e) =>
                          updateRate(
                            "fixed",
                            "accountant_and_audit",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full pl-8 pr-3 py-3 border-2 border-gray-300 rounded-md text-gray-900 bg-white font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      CMO Fee
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        value={currentRates.fixed.cmo}
                        onChange={(e) =>
                          updateRate(
                            "fixed",
                            "cmo",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full pl-8 pr-3 py-3 border-2 border-gray-300 rounded-md text-gray-900 bg-white font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Monthly Capacity (Hours)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">
                        h
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        value={currentRates.fixed.monthlyCapacityHours}
                        onChange={(e) =>
                          updateRate(
                            "fixed",
                            "monthlyCapacityHours",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full pl-8 pr-3 py-3 border-2 border-gray-300 rounded-md text-gray-900 bg-white font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t-2 border-gray-200">
                  <div className="flex justify-between items-center bg-red-50 p-4 rounded-lg">
                    <span className="font-bold text-gray-900 text-lg">
                      Total Fixed Costs:
                    </span>
                    <span className="text-2xl font-bold text-red-600">
                      ${currentRates.fixed.totalFixedCost.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Calculation Formulas Reference */}
              <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg shadow-lg p-6 border border-blue-200">
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-3">📐</span>
                  <h2 className="text-xl font-bold text-gray-900">
                    Calculation Formulas
                  </h2>
                </div>
                <div className="bg-white rounded-md p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="font-semibold text-gray-700 min-w-[140px]">
                      Sheets:
                    </span>
                    <code className="text-blue-700 font-mono bg-blue-50 px-3 py-1 rounded">
                      numberOfSteps × 2 + 4
                    </code>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="font-semibold text-gray-700 min-w-[140px]">
                      Resin (liters):
                    </span>
                    <code className="text-blue-700 font-mono bg-blue-50 px-3 py-1 rounded">
                      (0.8 / 22) × (numberOfSteps + 2)
                    </code>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="font-semibold text-gray-700 min-w-[140px]">
                      Execution Time:
                    </span>
                    <code className="text-blue-700 font-mono bg-blue-50 px-3 py-1 rounded">
                      numberOfSteps × 0.15 (9 mins/step)
                    </code>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="sticky bottom-6 bg-white rounded-lg shadow-xl p-6 border-2 border-blue-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    <p className="font-medium text-gray-900">
                      Editing rates for year:{" "}
                      <span className="text-blue-600 font-bold text-lg">
                        {selectedYear}
                      </span>
                    </p>
                    <p className="text-xs mt-1">
                      Changes will be saved to the database
                    </p>
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`px-8 py-4 rounded-lg font-bold text-lg shadow-lg transition-all ${saving
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 hover:shadow-xl transform hover:-translate-y-0.5"
                      } text-white`}
                  >
                    {saving ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin h-5 w-5 mr-2"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Saving...
                      </span>
                    ) : (
                      "💾 Save Changes"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
