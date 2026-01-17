import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

interface DbPatient extends RowDataPacket {
  id: number;
  user_id: number;
  patient_name: string;
  first_name: string;
  last_name: string;
  age: number;
  gender: string;
  number_of_steps: number;
  treatment_started: string;
  treatment_ended: string | null;
  timer_delivery_ended_at: string | null;
  status: string;
  price: number;
  remaining_amount: number;
  clinic_id: number;
  clinic_name: string;
  scanner_id: number;
  scanner_name: string;
  printer_id: number;
  printer_name: string;
  designer_id: number;
  designer_name: string;
  plan_name: string;
  created_at: string;
  updated_at: string;
  treatment_year: number;
}

interface CostRateYear extends RowDataPacket {
  id: number;
  year: number;
}

interface VariableCostRate extends RowDataPacket {
  year_id: number;
  sheet_rate: number;
  case_rate: number;
  resin_rate: number;
  bag_rate: number;
  box_rate: number;
}

interface DirectCostRate extends RowDataPacket {
  year_id: number;
  design_rate: number;
  alcohol_rate: number;
  tissues_rate: number;
  tools_rate: number;
  marketing_fee_rate: number;
}

interface FixedCost extends RowDataPacket {
  year_id: number;
  rent: number;
  utilities: number;
  salaries: number;
  internet: number;
  legal: number;
  accountant_and_audit: number;
  cmo: number;
  monthly_capacity_hours: number;
}

export async function GET() {
  try {
    // Fetch patients with timer_delivery_ended_at
    const [patients] = await pool.query<DbPatient[]>(
      `SELECT v.*, p.timer_delivery_ended_at 
       FROM patient_treatment_view v 
       LEFT JOIN patients p ON v.id = p.id 
       WHERE p.timer_delivery_ended_at IS NOT NULL
       ORDER BY p.timer_delivery_ended_at DESC`
    );

    // Fetch all years and rates
    const [years] = await pool.query<CostRateYear[]>(
      "SELECT * FROM cost_rate_years ORDER BY year ASC"
    );
    const [variableRates] = await pool.query<VariableCostRate[]>(
      "SELECT * FROM variable_cost_rates"
    );
    const [directRates] = await pool.query<DirectCostRate[]>(
      "SELECT * FROM direct_cost_rates"
    );
    const [fixedCosts] = await pool.query<FixedCost[]>(
      "SELECT * FROM fixed_costs"
    );

    // Build rates lookup by year_id
    const variableRatesMap = new Map(variableRates.map((r) => [r.year_id, r]));
    const directRatesMap = new Map(directRates.map((r) => [r.year_id, r]));
    const fixedCostsMap = new Map(fixedCosts.map((r) => [r.year_id, r]));
    const yearIdMap = new Map(years.map((y) => [y.year, y.id]));

    // First pass: Prepare yearMonth keys and count treatments per month
    const patientCountByYearMonth = new Map<string, number>();
    const patientsWithKeys = patients.map((patient) => {
      // Group by year and month using format 'YYYY-M' strictly based on handover date
      // We know timer_delivery_ended_at is present due to SQL filter
      const dateToUse = new Date(patient.timer_delivery_ended_at!);

      const year = dateToUse.getFullYear();
      const month = dateToUse.getMonth(); // 0-11
      const yearMonthKey = `${year}-${month}`;

      const count = (patientCountByYearMonth.get(yearMonthKey) || 0) + 1;
      patientCountByYearMonth.set(yearMonthKey, count);

      // DEBUG LOG
      if (Math.random() < 0.1) {
        console.log(`Patient ${patient.id} (${patient.patient_name}):`, {
          timerDelivery: patient.timer_delivery_ended_at,
          treatmentStart: patient.treatment_started,
          usedDate: dateToUse.toISOString(),
          key: yearMonthKey
        });
      }

      return { ...patient, yearMonthKey };
    });

    console.log("Monthly Counts:", Object.fromEntries(patientCountByYearMonth));

    // Second pass: Calculate finals with counts
    const calculatedPatients = patientsWithKeys.map((patient) => {
      const yearMonthKey = patient.yearMonthKey;
      const treatmentsInMonth = patientCountByYearMonth.get(yearMonthKey) || 1;

      // Determine allocation year from the key (preferred) or treatment year
      // yearMonthKey is "YYYY-M"
      const allocationYear = parseInt(yearMonthKey.split("-")[0]);

      const yearId = yearIdMap.get(patient.treatment_year);
      const allocationYearId = yearIdMap.get(allocationYear);

      const variableRate = yearId ? variableRatesMap.get(yearId) : null;
      const directRate = yearId ? directRatesMap.get(yearId) : null;
      // Use allocation year for fixed costs
      const fixedCost = allocationYearId ? fixedCostsMap.get(allocationYearId) : (yearId ? fixedCostsMap.get(yearId) : null);

      // Default rates if year not found
      const vRates = variableRate || {
        sheet_rate: 8,
        case_rate: 45,
        resin_rate: 120,
        bag_rate: 0.5,
        box_rate: 15,
      };
      const dRates = directRate || {
        design_rate: 150,
        alcohol_rate: 10,
        tissues_rate: 5,
        tools_rate: 20,
        marketing_fee_rate: 7,
      };
      const fCosts = fixedCost || {
        rent: 5000,
        utilities: 800,
        salaries: 15000,
        internet: 200,
        legal: 500,
        accountant_and_audit: 1000,
        cmo: 5000,
        monthly_capacity_hours: 192,
      };

      // Calculate monthly fixed costs
      const monthlyFixedCost =
        Number(fCosts.rent || 0) +
        Number(fCosts.utilities || 0) +
        Number(fCosts.salaries || 0) +
        Number(fCosts.internet || 0) +
        Number(fCosts.legal || 0) +
        Number(fCosts.accountant_and_audit || 0) +
        (allocationYear < 2026 ? 0 : Number(fCosts.cmo || 0));

      // Balanced allocation logic
      const monthlyFixedAllocation = monthlyFixedCost / treatmentsInMonth;

      // Hours-based allocation logic
      // Default to 0.5 hours per step (30 mins) if not specified
      const estimatedHours = patient.number_of_steps * 0.15; // 9 minutes per step
      const capacityHours =
        fCosts.monthly_capacity_hours != null
          ? Number(fCosts.monthly_capacity_hours)
          : 160;
      // Prevent division by zero
      const safeCapacityHours = capacityHours > 0 ? capacityHours : 192;

      const allocatedFixedCost = (monthlyFixedCost * estimatedHours) / safeCapacityHours;
      const remainingOverhead = monthlyFixedCost - allocatedFixedCost;

      // Calculate variable costs
      const sheetsQuantity = patient.number_of_steps * 2 + 4;
      const sheetsCost = sheetsQuantity * Number(vRates.sheet_rate);
      const caseQuantity = 1;
      const caseCost = caseQuantity * Number(vRates.case_rate);
      const resinQuantity = (0.8 / 22) * (patient.number_of_steps + 2);
      const resinCost = resinQuantity * Number(vRates.resin_rate);
      const bagQuantity = 1;
      const bagCost = bagQuantity * Number(vRates.bag_rate);
      const boxQuantity = 1;
      const boxCost = boxQuantity * Number(vRates.box_rate);
      const totalVariableCost =
        sheetsCost + caseCost + resinCost + bagCost + boxCost;

      // Calculate direct costs
      const designQuantity = 1;
      const designCost = designQuantity * Number(dRates.design_rate);
      const alcoholCost = Number(dRates.alcohol_rate);
      const tissuesCost = Number(dRates.tissues_rate);

      // Production tools formula: (price_per_head × number_of_sheets × 0.6) + $2
      const headsNeeded = sheetsQuantity * 0.6;
      const headsCost = headsNeeded * Number(dRates.tools_rate);
      const toolsCost = headsCost + 2;

      // Marketing Fee (calculated from price)
      const marketingFeeRate =
        dRates.marketing_fee_rate != null
          ? Number(dRates.marketing_fee_rate)
          : 7;
      const patientPrice = patient.price != null ? Number(patient.price) : 0;
      const marketingFee = patientPrice * (marketingFeeRate / 100);

      const totalDirectCost =
        designCost + alcoholCost + tissuesCost + toolsCost + marketingFee;

      const totalCost =
        totalVariableCost + totalDirectCost + allocatedFixedCost;

      // Handle Clinic ID 1 special logic: Price = Total Cost
      // Only applies from Dec 2025 onwards
      const isClinic1 = patient.clinic_id === 1 || patient.clinic_id === 5 || patient.clinic_id === 34;
      let finalPrice = patient.price != null ? Number(patient.price) : 0;

      // Extract month from key "YYYY-M"
      const allocationMonth = parseInt(yearMonthKey.split("-")[1]);
      const isClinic1Exception = isClinic1 && (allocationYear > 2025 || (allocationYear === 2025 && allocationMonth === 11));

      if (isClinic1Exception) {
        finalPrice = totalCost;
      }

      const remainingAmount =
        patient.remaining_amount != null ? Number(patient.remaining_amount) : 0;

      let profit = finalPrice - totalCost;

      // Special profit logic for Clinic 1 exception: Profit = Price - Overhead Share (Monthly Allocation)
      if (isClinic1Exception) {
        profit = finalPrice - monthlyFixedAllocation;
      }

      const profitMargin = finalPrice > 0 ? (profit / finalPrice) * 100 : 0;

      return {
        id: patient.id.toString(),
        name: patient.patient_name,
        email: "",
        phone: "",
        clinicName: patient.clinic_name || "",
        scannerId: patient.scanner_name || "",
        printerId: patient.printer_name || "",
        treatmentStarted: patient.treatment_started,
        treatmentEnded: patient.treatment_ended,
        timerDeliveryEndedAt: patient.timer_delivery_ended_at
          ? new Date(patient.timer_delivery_ended_at)
          : undefined,
        status: patient.status,
        price: finalPrice,
        paymentRemaining: remainingAmount,
        numberOfSteps: patient.number_of_steps,
        refinement: false,
        treatmentYear: allocationYear, // Use allocation year for filtering/grouping
        variableCosts: {
          sheets: {
            quantity: sheetsQuantity,
            ratePerSheet: Number(vRates.sheet_rate),
            totalCost: sheetsCost,
          },
          caseAndAccessories: {
            quantity: caseQuantity,
            ratePerCase: Number(vRates.case_rate),
            totalCost: caseCost,
          },
          resin: {
            quantity: resinQuantity,
            ratePerLiter: Number(vRates.resin_rate),
            totalCost: resinCost,
          },
          bag: {
            quantity: bagQuantity,
            ratePerBag: Number(vRates.bag_rate),
            totalCost: bagCost,
          },
          packagingBox: {
            quantity: boxQuantity,
            ratePerBox: Number(vRates.box_rate),
            totalCost: boxCost,
          },
          totalVariableCost,
        },
        directCosts: {
          design: {
            quantity: designQuantity,
            ratePerDesign: Number(dRates.design_rate),
            totalCost: designCost,
          },
          alcohol: {
            ratePerTreatment: Number(dRates.alcohol_rate),
            totalCost: alcoholCost,
          },
          tissues: {
            ratePerTreatment: Number(dRates.tissues_rate),
            totalCost: tissuesCost,
          },
          productionTools: {
            ratePerTreatment: Number(dRates.tools_rate), // Price per head
            totalCost: toolsCost,
          },
          marketingFee: {
            rate: marketingFeeRate,
            totalCost: marketingFee,
          },
          totalDirectCost,
        },
        totalCost,
        profit,
        profitMargin,
        allocatedFixedCost,
        remainingOverhead,
        monthlyFixedAllocation,
        estimatedHours,
        revenuePerHour: estimatedHours > 0 ? finalPrice / estimatedHours : 0,
        profitPerHour: estimatedHours > 0 ? profit / estimatedHours : 0,
      };
    });

    return NextResponse.json({
      success: true,
      data: calculatedPatients,
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch patients",
      },
      { status: 500 }
    );
  }
}
