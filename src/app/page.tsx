"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import FinancialOverview from "@/components/FinancialOverview";
import BreakEvenAnalysis from "@/components/BreakEvenAnalysis";
import PatientTable from "@/components/PatientTable";
import CostBreakdown from "@/components/CostBreakdown";
import CostSettings, { YearlyRates } from "@/components/CostSettings";
import {
  calculateDashboardStats,
  calculateFinancialSummary,
} from "@/lib/calculations";
import { TreatmentRecord } from "@/types";

export default function Home() {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null
  );
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const [treatments, setTreatments] = useState<TreatmentRecord[]>([]);
  const [yearlyRates, setYearlyRates] = useState<YearlyRates>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSimulation, setIsSimulation] = useState(false);
  const [simulationCount, setSimulationCount] = useState(500);

  // Generate simulation data
  const generateSimulationData = useMemo(() => {
    return (): TreatmentRecord[] => {
      const currentYear = new Date().getFullYear();
      const simulationData: TreatmentRecord[] = [];

      // Get rates for current year or use defaults
      const rates = yearlyRates[currentYear] || {
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
          rent: 5000,
          utilities: 800,
          salaries: 15000,
          internet: 200,
          legal: 500,
          accountant_and_audit: 1000,
          cmo: 5000,
          monthlyCapacityHours: 192,
          totalFixedCost: 27500,
        },
      };

      // Calculate fixed cost per patient (for current year, 11 months)
      const allocatedFixedCost =
        (rates.fixed.totalFixedCost * 11) / simulationCount;

      for (let i = 1; i <= simulationCount; i++) {
        const numberOfSteps = 20;
        const price = 1000;

        // Calculate variable costs
        const sheetsQty = numberOfSteps * 2 + 4;
        const resinQty = (0.8 / 22) * (numberOfSteps + 2);

        const sheetsCost = sheetsQty * rates.variable.sheetRate;
        const caseCost = 1 * rates.variable.caseRate;
        const resinCost = resinQty * rates.variable.resinRate;
        const bagCost = 1 * rates.variable.bagRate;
        const boxCost = 1 * rates.variable.boxRate;

        const totalVariableCost =
          sheetsCost + caseCost + resinCost + bagCost + boxCost;

        // Calculate direct costs
        const designCost = 1 * rates.direct.designRate;
        const alcoholCost = rates.direct.alcoholRate;
        const tissuesCost = rates.direct.tissuesRate;
        const toolsRate = rates.direct.toolsRate;
        const toolsCost = toolsRate * sheetsQty * 0.6 + 2;
        const marketingFee =
          price * ((rates.direct.marketingFeeRate || 7) / 100);

        const totalDirectCost =
          designCost + alcoholCost + tissuesCost + toolsCost + marketingFee;

        const estimatedHours = numberOfSteps * 0.15; // 9 minutes per step
        const allocatedFixedCost =
          (rates.fixed.totalFixedCost * estimatedHours) /
          (rates.fixed.monthlyCapacityHours || 192);

        const totalCost =
          totalVariableCost + totalDirectCost + allocatedFixedCost;
        const profit = price - totalCost;
        const profitMargin = (profit / price) * 100;

        simulationData.push({
          id: `SIM-${i.toString().padStart(4, "0")}`,
          name: `Simulation Patient ${i}`,
          email: `patient${i}@simulation.com`,
          phone: `555-${i.toString().padStart(4, "0")}`,
          clinicName: `Clinic ${(i % 10) + 1}`,
          scannerId: "1",
          printerId: "1",
          status: "active",
          numberOfSteps: numberOfSteps,
          refinement: false,
          refinementSteps: 0,
          price: price,
          treatmentStarted: new Date(currentYear, 0, 1),
          treatmentYear: currentYear,
          paymentRemaining: 0,
          variableCosts: {
            sheets: {
              quantity: sheetsQty,
              ratePerSheet: rates.variable.sheetRate,
              totalCost: sheetsCost,
            },
            caseAndAccessories: {
              quantity: 1,
              ratePerCase: rates.variable.caseRate,
              totalCost: caseCost,
            },
            resin: {
              quantity: resinQty,
              ratePerLiter: rates.variable.resinRate,
              totalCost: resinCost,
            },
            bag: {
              quantity: 1,
              ratePerBag: rates.variable.bagRate,
              totalCost: bagCost,
            },
            packagingBox: {
              quantity: 1,
              ratePerBox: rates.variable.boxRate,
              totalCost: boxCost,
            },
            totalVariableCost,
          },
          directCosts: {
            design: {
              quantity: 1,
              ratePerDesign: rates.direct.designRate,
              totalCost: designCost,
            },
            alcohol: {
              ratePerTreatment: rates.direct.alcoholRate,
              totalCost: alcoholCost,
            },
            tissues: {
              ratePerTreatment: rates.direct.tissuesRate,
              totalCost: tissuesCost,
            },
            productionTools: {
              ratePerTreatment: toolsRate,
              totalCost: toolsCost,
            },
            marketingFee: {
              rate: rates.direct.marketingFeeRate || 7,
              totalCost: marketingFee,
            },
            totalDirectCost,
          },
          totalCost,
          profit,
          profitMargin,
          allocatedFixedCost,
          monthlyFixedAllocation: allocatedFixedCost, // Added property for TreatmentRecord compliance
          remainingOverhead: rates.fixed.totalFixedCost - allocatedFixedCost,
          estimatedHours,
          revenuePerHour: price / estimatedHours,
          profitPerHour: profit / estimatedHours,
        });
      }

      return simulationData;
    };
  }, [yearlyRates, simulationCount]);

  // Fetch patients and cost rates from database
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch patients (already calculated in backend)
        const patientsRes = await fetch("/api/patients");
        const patientsData = await patientsRes.json();

        if (!patientsData.success) {
          throw new Error(patientsData.error || "Failed to fetch patients");
        }

        // Fetch cost rates
        const ratesRes = await fetch("/api/cost-rates");
        const ratesData = await ratesRes.json();

        if (!ratesData.success) {
          throw new Error(ratesData.error || "Failed to fetch cost rates");
        }

        setTreatments(patientsData.data);
        setYearlyRates(ratesData.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Get unique years from treatments
  const availableYears = useMemo(() => {
    if (treatments.length === 0) return [];
    const years = treatments
      .filter((t) => t.treatmentYear != null)
      .map((t) => t.treatmentYear!);
    return Array.from(new Set(years)).sort();
  }, [treatments]);

  // Filter treatments by selected year (no recalculation needed - backend does it)
  const filteredTreatments = useMemo(() => {
    const dataToFilter = isSimulation ? generateSimulationData() : treatments;
    if (selectedYear === "all") {
      return dataToFilter;
    }
    return dataToFilter.filter((t) => t.treatmentYear === selectedYear);
  }, [treatments, selectedYear, isSimulation, generateSimulationData]);

  // Calculate fixed costs for the selected year (or average for 'all')
  const currentFixedCosts = useMemo(() => {
    const defaultFixed = {
      rent: 5000,
      utilities: 800,
      salaries: 15000,
      internet: 200,
      legal: 500,
      accountant_and_audit: 1000,
      cmo: 5000,
      monthlyCapacityHours: 192,
      totalFixedCost: 27500,
    };

    if (selectedYear === "all") {
      // Calculate average fixed costs across all years
      const years = Object.keys(yearlyRates).map(Number);
      if (years.length === 0) return defaultFixed;

      const avgRent =
        years.reduce((sum, y) => sum + yearlyRates[y].fixed.rent, 0) /
        years.length;
      const avgUtilities =
        years.reduce((sum, y) => sum + yearlyRates[y].fixed.utilities, 0) /
        years.length;
      const avgSalaries =
        years.reduce((sum, y) => sum + yearlyRates[y].fixed.salaries, 0) /
        years.length;
      const avgInternet =
        years.reduce((sum, y) => sum + yearlyRates[y].fixed.internet, 0) /
        years.length;
      const avgLegal =
        years.reduce((sum, y) => sum + yearlyRates[y].fixed.legal, 0) /
        years.length;
      const avgAccountant =
        years.reduce(
          (sum, y) => sum + yearlyRates[y].fixed.accountant_and_audit,
          0
        ) / years.length;
      const avgCmo =
        years.reduce((sum, y) => sum + yearlyRates[y].fixed.cmo, 0) /
        years.length;
      const avgCapacity =
        years.reduce(
          (sum, y) => sum + (yearlyRates[y].fixed.monthlyCapacityHours || 192),
          0
        ) / years.length;

      return {
        rent: avgRent,
        utilities: avgUtilities,
        salaries: avgSalaries,
        internet: avgInternet,
        legal: avgLegal,
        accountant_and_audit: avgAccountant,
        cmo: avgCmo,
        monthlyCapacityHours: avgCapacity,
        totalFixedCost:
          avgRent +
          avgUtilities +
          avgSalaries +
          avgInternet +
          avgLegal +
          avgAccountant +
          avgCmo,
      };
    }
    return yearlyRates[selectedYear]?.fixed || defaultFixed;
  }, [selectedYear, yearlyRates]);

  const stats = calculateDashboardStats(
    filteredTreatments,
    yearlyRates,
    selectedYear
  );
  const financialSummary = calculateFinancialSummary(
    filteredTreatments,
    yearlyRates,
    selectedYear
  );
  const selectedPatient = selectedPatientId
    ? filteredTreatments.find((t) => t.id === selectedPatientId)
    : null;

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={80}
            height={80}
            className="mx-auto mb-6"
          />
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={64}
            height={64}
            className="mx-auto mb-4"
          />
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Data
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show empty state
  if (treatments.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Image src="/logo.svg" alt="Logo" width={48} height={48} />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Treatment Costs & Profitability Dashboard
                    {isSimulation && (
                      <span className="ml-3 text-lg text-blue-600">
                        (Simulation Mode)
                      </span>
                    )}
                  </h1>
                  <p className="mt-1 text-sm text-gray-600">
                    Track patient treatments, costs, payments, and financial
                    performance
                  </p>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                {isSimulation && (
                  <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-md">
                    <label
                      htmlFor="simCount"
                      className="text-sm font-medium text-gray-700"
                    >
                      Treatments:
                    </label>
                    <input
                      id="simCount"
                      type="number"
                      min="1"
                      max="10000"
                      value={simulationCount}
                      onChange={(e) =>
                        setSimulationCount(
                          Math.max(1, parseInt(e.target.value) || 1)
                        )
                      }
                      className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    />
                  </div>
                )}
                <button
                  onClick={() => setIsSimulation(!isSimulation)}
                  className={`px-4 py-2 rounded-md font-medium ${isSimulation
                    ? "bg-orange-600 hover:bg-orange-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                >
                  {isSimulation ? "📊 Exit Simulation" : "🎮 Run Simulation"}
                </button>
                <Link
                  href="/constants"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <span>Overhead Share:</span>
                </Link>
                <Link
                  href="/formulas"
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  View Formulas
                </Link>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Patients Found
            </h2>
            <p className="text-gray-600">
              No patient data is available in the database yet.
            </p>
          </div>
        </main>
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
                  Treatment Costs & Profitability Dashboard
                  {isSimulation && (
                    <span className="ml-3 text-lg text-blue-600">
                      (Simulation Mode)
                    </span>
                  )}
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Track patient treatments, costs, payments, and financial
                  performance
                </p>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              {isSimulation && (
                <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-md">
                  <label
                    htmlFor="simCountMain"
                    className="text-sm font-medium text-gray-700"
                  >
                    Treatments:
                  </label>
                  <input
                    id="simCountMain"
                    type="number"
                    min="1"
                    max="10000"
                    value={simulationCount}
                    onChange={(e) =>
                      setSimulationCount(
                        Math.max(1, parseInt(e.target.value) || 1)
                      )
                    }
                    className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
              )}
              <button
                onClick={() => setIsSimulation(!isSimulation)}
                className={`px-4 py-2 rounded-md font-medium ${isSimulation
                  ? "bg-orange-600 hover:bg-orange-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
              >
                {isSimulation ? "📊 Exit Simulation" : "🎮 Run Simulation"}
              </button>
              <Link
                href="/constants"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Manage Constants
              </Link>
              <Link
                href="/formulas"
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                View Formulas
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 space-y-6">
          <CostSettings
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            yearlyRates={yearlyRates}
            onYearlyRatesChange={setYearlyRates}
            availableYears={availableYears}
          />

          <FinancialOverview stats={stats} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BreakEvenAnalysis summary={financialSummary} />

            {selectedPatient ? (
              <div>
                <button
                  onClick={() => setSelectedPatientId(null)}
                  className="mb-4 text-sm text-blue-600 hover:text-blue-800"
                >
                  ← Back to all patients
                </button>
                <CostBreakdown treatment={selectedPatient} />
              </div>
            ) : (
              selectedYear !== "all" && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Fixed Costs (Monthly) - {selectedYear}
                  </h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rent</span>
                      <span className="font-medium text-gray-900">
                        ${(currentFixedCosts.rent || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Utilities</span>
                      <span className="font-medium text-gray-900">
                        ${(currentFixedCosts.utilities || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Salaries</span>
                      <span className="font-medium text-gray-900">
                        ${(currentFixedCosts.salaries || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Internet</span>
                      <span className="font-medium text-gray-900">
                        ${(currentFixedCosts.internet || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Legal</span>
                      <span className="font-medium text-gray-900">
                        ${(currentFixedCosts.legal || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Accountant & Audit</span>
                      <span className="font-medium text-gray-900">
                        $
                        {(
                          currentFixedCosts.accountant_and_audit || 0
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">CMO + Marketing</span>
                      <span className="font-medium text-gray-900">
                        ${(currentFixedCosts.cmo || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between pt-3 border-t-2 border-gray-300">
                      <span className="font-bold text-gray-900">
                        Total Fixed Costs
                      </span>
                      <span className="font-bold text-lg text-red-600">
                        $
                        {(currentFixedCosts.totalFixedCost || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      💡 Click on a patient in the table below to see detailed
                      cost breakdown
                    </p>
                  </div>
                </div>
              )
            )}
          </div>

          <PatientTable
            treatments={filteredTreatments}
            onPatientClick={setSelectedPatientId}
          />
        </div>
      </main>
    </div>
  );
}
