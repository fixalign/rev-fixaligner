// Patient and Treatment Data Types
export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  clinicName: string;
  scannerId: string;
  printerId: string;
  treatmentStarted: Date;
  treatmentEnded?: Date;
  status: "active" | "completed" | "pending";
  price: number;
  paymentRemaining: number;
  numberOfSteps: number;
  refinement: boolean;
  refinementTime?: number;
  refinementSteps?: number;
  treatmentYear?: number;
}

// Variable Costs
export interface VariableCosts {
  sheets: {
    quantity: number;
    ratePerSheet: number;
    totalCost: number;
  };
  caseAndAccessories: {
    quantity: number;
    ratePerCase: number;
    totalCost: number;
  };
  resin: {
    quantity: number;
    ratePerLiter: number;
    totalCost: number;
  };
  bag: {
    quantity: number;
    ratePerBag: number;
    totalCost: number;
  };
  packagingBox: {
    quantity: number;
    ratePerBox: number;
    totalCost: number;
  };
  totalVariableCost: number;
}

// Direct Costs
export interface DirectCosts {
  design: {
    quantity: number;
    ratePerDesign: number;
    totalCost: number;
  };
  alcohol: {
    ratePerTreatment: number;
    totalCost: number;
  };
  tissues: {
    ratePerTreatment: number;
    totalCost: number;
  };
  productionTools: {
    ratePerTreatment: number;
    totalCost: number;
  };
  totalDirectCost: number;
}

// Fixed Costs
export interface FixedCosts {
  rent: number;
  utilities: number;
  salaries: number;
  internet: number;
  legal: number;
  accountant_and_audit: number;
  totalFixedCost: number;
}

// Complete Treatment Record
export interface TreatmentRecord extends Patient {
  variableCosts: VariableCosts;
  directCosts: DirectCosts;
  totalCost: number;
  profit: number;
  profitMargin: number;
  allocatedFixedCost?: number;
}

// Financial Summary
export interface FinancialSummary {
  totalRevenue: number;
  totalVariableCosts: number;
  totalDirectCosts: number;
  totalFixedCosts: number;
  totalCosts: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  breakEvenPoint: number;
  treatmentsPerYear: {
    year2024: number;
    year2025: number;
  };
}

// Dashboard Stats
export interface DashboardStats {
  totalPatients: number;
  activePatients: number;
  completedPatients: number;
  totalRevenue: number;
  totalCosts: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  averageRevenuePerPatient: number;
  averageCostPerPatient: number;
  paymentsRemaining: number;
}
