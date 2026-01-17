import {
  TreatmentRecord,
  FinancialSummary,
  DashboardStats,
  FixedCosts,
} from "@/types";

export function calculateVariableCosts(record: Partial<TreatmentRecord>) {
  const sheets =
    (record.variableCosts?.sheets.quantity || 0) *
    (record.variableCosts?.sheets.ratePerSheet || 0);
  const caseAndAccessories =
    (record.variableCosts?.caseAndAccessories.quantity || 0) *
    (record.variableCosts?.caseAndAccessories.ratePerCase || 0);
  const resin =
    (record.variableCosts?.resin.quantity || 0) *
    (record.variableCosts?.resin.ratePerLiter || 0);
  const bag =
    (record.variableCosts?.bag.quantity || 0) *
    (record.variableCosts?.bag.ratePerBag || 0);
  const packagingBox =
    (record.variableCosts?.packagingBox.quantity || 0) *
    (record.variableCosts?.packagingBox.ratePerBox || 0);

  return sheets + caseAndAccessories + resin + bag + packagingBox;
}

export function calculateDirectCosts(record: Partial<TreatmentRecord>) {
  const design =
    (record.directCosts?.design.quantity || 0) *
    (record.directCosts?.design.ratePerDesign || 0);
  const alcohol = record.directCosts?.alcohol.totalCost || 0;
  const tissues = record.directCosts?.tissues.totalCost || 0;
  const productionTools = record.directCosts?.productionTools.totalCost || 0;

  return design + alcohol + tissues + productionTools;
}

export function calculateTotalCost(
  record: TreatmentRecord,
  fixedCosts: FixedCosts
) {
  const variableCost = record.variableCosts.totalVariableCost;
  const directCost = record.directCosts.totalDirectCost;
  const estimatedHours = record.numberOfSteps * 0.15; // 9 minutes per step
  const allocatedFixedCost = (fixedCosts.totalFixedCost * estimatedHours) / (fixedCosts.monthlyCapacityHours || 192);

  return variableCost + directCost + allocatedFixedCost;
}

export function calculateProfit(revenue: number, totalCost: number) {
  return revenue - totalCost;
}

export function calculateProfitMargin(profit: number, revenue: number) {
  return revenue > 0 ? (profit / revenue) * 100 : 0;
}

export function calculateFinancialSummary(
  records: TreatmentRecord[],
  yearlyRates: any,
  selectedYear: string | number
): FinancialSummary {
  const totalRevenue = records.reduce((sum, r) => sum + r.price, 0);
  const totalVariableCosts = records.reduce(
    (sum, r) => sum + r.variableCosts.totalVariableCost,
    0
  );
  const totalDirectCosts = records.reduce(
    (sum, r) => sum + r.directCosts.totalDirectCost,
    0
  );

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  let totalFixedCostsAccumulated = 0;
  let monthsCounted = 0;

  const getYearlyData = (year: string | number) => {
    const data = yearlyRates[year] || yearlyRates[year.toString()];
    if (data) return data;

    // Fallback to sensible defaults ONLY if year data is missing
    return {
      variable: { sheetRate: 8, caseRate: 45, resinRate: 120, bagRate: 0.5, boxRate: 15 },
      direct: { designRate: 150, alcoholRate: 10, tissuesRate: 5, toolsRate: 20, marketingFeeRate: 7 },
      fixed: { rent: 5000, utilities: 800, salaries: 15000, internet: 200, legal: 500, accountant_and_audit: 1000, cmo: 5000, monthlyCapacityHours: 192, totalFixedCost: 27500 }
    };
  };

  if (selectedYear === "all") {
    const yearsSet = new Set<number>();
    Object.keys(yearlyRates).forEach(y => yearsSet.add(parseInt(y)));
    records.forEach(r => r.treatmentYear && yearsSet.add(r.treatmentYear));
    if (yearsSet.size === 0) yearsSet.add(currentYear);

    yearsSet.forEach(year => {
      if (year <= currentYear) {
        const monthsInYear = year === currentYear ? currentMonth : 12;
        const rates = getYearlyData(year);
        totalFixedCostsAccumulated += (rates?.fixed?.totalFixedCost || 27500) * monthsInYear;
        monthsCounted += monthsInYear;
      }
    });
  } else {
    const year = typeof selectedYear === "string" ? parseInt(selectedYear) : (selectedYear || currentYear);
    const monthsInYear = year === currentYear ? currentMonth : 12;
    const rates = getYearlyData(year);
    totalFixedCostsAccumulated = (rates?.fixed?.totalFixedCost || 27500) * monthsInYear;
    monthsCounted = monthsInYear;
  }

  const totalFixedCosts = totalFixedCostsAccumulated;
  const totalCosts = (totalVariableCosts || 0) + (totalDirectCosts || 0) + (totalFixedCosts || 0);
  const grossProfit = (totalRevenue || 0) - ((totalVariableCosts || 0) + (totalDirectCosts || 0));
  const netProfit = (totalRevenue || 0) - totalCosts;
  const profitMargin = calculateProfitMargin(netProfit, totalRevenue);

  const avgRevenuePerPatient = records.length > 0 ? (totalRevenue || 0) / records.length : 0;
  const avgVariableCostPerPatient = records.length > 0
    ? ((totalVariableCosts || 0) + (totalDirectCosts || 0)) / records.length
    : 0;
  const contributionMargin = avgRevenuePerPatient - avgVariableCostPerPatient;

  const currentYearRates = getYearlyData(selectedYear === "all" ? currentYear : selectedYear);
  const monthlyFixed = currentYearRates?.fixed?.totalFixedCost || 27500;

  const monthlyBreakEven = contributionMargin > 0
    ? Math.ceil(monthlyFixed / contributionMargin)
    : 0;

  const breakEvenPoint = contributionMargin > 0
    ? Math.ceil(totalFixedCosts / contributionMargin)
    : 0;

  const treatmentsPerYear: Record<string, number> = {};
  records.forEach((r) => {
    const y = r.treatmentYear || currentYear;
    const yearKey = `year${y}`;
    treatmentsPerYear[yearKey] = (treatmentsPerYear[yearKey] || 0) + 1;
  });

  return {
    totalRevenue: totalRevenue || 0,
    totalPatients: records.length,
    totalVariableCosts: totalVariableCosts || 0,
    totalDirectCosts: totalDirectCosts || 0,
    totalFixedCosts: totalFixedCosts || 0,
    totalCosts: totalCosts || 0,
    grossProfit: grossProfit || 0,
    netProfit: netProfit || 0,
    profitMargin: profitMargin || 0,
    breakEvenPoint: breakEvenPoint || 0,
    monthlyBreakEven: monthlyBreakEven || 0,
    monthsCounted,
    treatmentsPerYear,
  };
}

export function calculateDashboardStats(
  records: TreatmentRecord[],
  yearlyRates: any,
  selectedYear: string | number
): DashboardStats {
  const totalPatients = records.length;

  const activePatients = records.filter((r) => {
    const status = (r.status || "").toLowerCase();
    return (
      status.includes("active") ||
      status.includes("ongoing") ||
      status.includes("in progress")
    );
  }).length;

  const completedPatients = records.filter((r) => {
    const status = (r.status || "").toLowerCase();
    return (
      status.includes("completed") ||
      status.includes("complete") ||
      status.includes("finished")
    );
  }).length;

  const totalRevenue = records.reduce((sum, r) => sum + (r.price || 0), 0);

  const totalPatientCosts = records.reduce((sum, r) => sum + (r.totalCost || 0), 0);
  const totalVariableDirectCosts = records.reduce(
    (sum, r) =>
      sum + (r.variableCosts?.totalVariableCost || 0) + (r.directCosts?.totalDirectCost || 0),
    0
  );

  const grossProfit = totalRevenue - totalVariableDirectCosts;
  const operationalProfit = totalRevenue - totalPatientCosts;

  const summary = calculateFinancialSummary(records, yearlyRates, selectedYear);
  const netProfit = summary.netProfit;
  const profitMargin = summary.profitMargin;

  const averageRevenuePerPatient =
    totalPatients > 0 ? totalRevenue / totalPatients : 0;
  const averageCostPerPatient =
    totalPatients > 0 ? totalPatientCosts / totalPatients : 0;
  const paymentsRemaining = records.reduce(
    (sum, r) => sum + (r.paymentRemaining || 0),
    0
  );

  return {
    totalPatients,
    activePatients,
    completedPatients,
    totalRevenue,
    totalCosts: summary.totalCosts,
    grossProfit,
    operationalProfit,
    netProfit,
    profitMargin,
    averageRevenuePerPatient,
    averageCostPerPatient,
    paymentsRemaining,
    monthsCounted: summary.monthsCounted,
  };
}

export function formatCurrency(amount: number | string | null | undefined): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (num === null || num === undefined || isNaN(num as number)) {
    return "$0.00";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num as number);
}

export function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "0.00%";
  }
  return `${value.toFixed(2)}%`;
}
