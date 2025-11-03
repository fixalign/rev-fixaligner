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
  fixedCosts: FixedCosts,
  totalPatients: number
) {
  const variableCost = record.variableCosts.totalVariableCost;
  const directCost = record.directCosts.totalDirectCost;
  const allocatedFixedCost =
    totalPatients > 0 ? fixedCosts.totalFixedCost / totalPatients : 0;

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
  fixedCosts: FixedCosts
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

  // Calculate total fixed costs based on years and months passed
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // 1-12

  // Get unique years from treatments
  const yearsInData = new Set(
    records.filter((r) => r.treatmentYear != null).map((r) => r.treatmentYear!)
  );

  // Calculate total fixed costs for all months passed
  let totalFixedCostsAccumulated = 0;
  yearsInData.forEach((year) => {
    const monthsForYear = year === currentYear ? currentMonth : 12;
    totalFixedCostsAccumulated += fixedCosts.totalFixedCost * monthsForYear;
  });

  const totalFixedCosts = totalFixedCostsAccumulated;
  const totalCosts = totalVariableCosts + totalDirectCosts + totalFixedCosts;
  const grossProfit = totalRevenue - (totalVariableCosts + totalDirectCosts);
  const netProfit = totalRevenue - totalCosts;
  const profitMargin = calculateProfitMargin(netProfit, totalRevenue);

  // Break-even point: Fixed Costs / (Revenue per unit - Variable Cost per unit)
  const avgRevenuePerPatient =
    records.length > 0 ? totalRevenue / records.length : 0;
  const avgVariableCostPerPatient =
    records.length > 0
      ? (totalVariableCosts + totalDirectCosts) / records.length
      : 0;
  const contributionMargin = avgRevenuePerPatient - avgVariableCostPerPatient;
  const breakEvenPoint =
    contributionMargin > 0
      ? Math.ceil(totalFixedCosts / contributionMargin)
      : 0;

  const year2024Count = records.filter((r) => r.treatmentYear === 2024).length;
  const year2025Count = records.filter((r) => r.treatmentYear === 2025).length;

  return {
    totalRevenue,
    totalVariableCosts,
    totalDirectCosts,
    totalFixedCosts,
    totalCosts,
    grossProfit,
    netProfit,
    profitMargin,
    breakEvenPoint,
    treatmentsPerYear: {
      year2024: year2024Count,
      year2025: year2025Count,
    },
  };
}

export function calculateDashboardStats(
  records: TreatmentRecord[],
  _fixedCosts: FixedCosts
): DashboardStats {
  const totalPatients = records.length;

  // More flexible status matching - convert to lowercase and check for partial matches
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

  const totalRevenue = records.reduce((sum, r) => sum + r.price, 0);

  const totalCosts = records.reduce((sum, r) => sum + r.totalCost, 0);
  const totalVariableCosts = records.reduce(
    (sum, r) =>
      sum + r.variableCosts.totalVariableCost + r.directCosts.totalDirectCost,
    0
  );
  const grossProfit = totalRevenue - totalVariableCosts;
  const netProfit = totalRevenue - totalCosts;
  const profitMargin = calculateProfitMargin(netProfit, totalRevenue);
  const averageRevenuePerPatient =
    totalPatients > 0 ? totalRevenue / totalPatients : 0;
  const averageCostPerPatient =
    totalPatients > 0 ? totalCosts / totalPatients : 0;
  const paymentsRemaining = records.reduce(
    (sum, r) => sum + r.paymentRemaining,
    0
  );

  return {
    totalPatients,
    activePatients,
    completedPatients,
    totalRevenue,
    totalCosts,
    grossProfit,
    netProfit,
    profitMargin,
    averageRevenuePerPatient,
    averageCostPerPatient,
    paymentsRemaining,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}
