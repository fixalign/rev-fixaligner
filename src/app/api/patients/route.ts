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
}

interface FixedCost extends RowDataPacket {
  year_id: number;
  rent: number;
  utilities: number;
  salaries: number;
  internet: number;
}

export async function GET() {
  try {
    // Fetch patients
    const [patients] = await pool.query<DbPatient[]>(
      "SELECT * FROM patient_treatment_view ORDER BY treatment_started DESC"
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

    // Count patients per year for fixed cost allocation
    const patientCountByYear = new Map<number, number>();
    patients.forEach((patient) => {
      if (patient.treatment_year != null) {
        const count = patientCountByYear.get(patient.treatment_year) || 0;
        patientCountByYear.set(patient.treatment_year, count + 1);
      }
    });

    // Get current date for prorating
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // 1-12

    // Calculate costs for each patient
    const calculatedPatients = patients.map((patient) => {
      const yearId = yearIdMap.get(patient.treatment_year);
      const variableRate = yearId ? variableRatesMap.get(yearId) : null;
      const directRate = yearId ? directRatesMap.get(yearId) : null;
      const fixedCost = yearId ? fixedCostsMap.get(yearId) : null;

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
      };
      const fCosts = fixedCost || {
        rent: 5000,
        utilities: 800,
        salaries: 15000,
        internet: 200,
      };

      // Calculate monthly fixed costs
      const monthlyFixedCost =
        Number(fCosts.rent) +
        Number(fCosts.utilities) +
        Number(fCosts.salaries) +
        Number(fCosts.internet);

      // Prorate fixed costs for current year (only count months elapsed)
      // For past years, use full 12 months
      const treatmentYear = patient.treatment_year;
      const isCurrentYear = treatmentYear === currentYear;
      const monthsToCount = isCurrentYear ? currentMonth : 12;
      const yearlyFixedCost = monthlyFixedCost * monthsToCount;

      // Allocate fixed costs per treatment based on patient count for that year
      const patientCount = patientCountByYear.get(treatmentYear) || 1;
      const allocatedFixedCost = yearlyFixedCost / patientCount;

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

      // Production tools formula: (price_per_head × number_of_sheets × 3/5) + $2
      // 3 heads needed for every 5 sheets, plus $2 fixed cost per treatment
      const headsNeeded = sheetsQuantity * (3 / 5);
      const headsCost = headsNeeded * Number(dRates.tools_rate); // tools_rate = price per head
      const toolsCost = headsCost + 2; // +$2 fixed cost per treatment

      const totalDirectCost =
        designCost + alcoholCost + tissuesCost + toolsCost;

      const totalCost =
        totalVariableCost + totalDirectCost + allocatedFixedCost;

      // Handle NULL values from database
      const price = patient.price != null ? Number(patient.price) : 0;
      const remainingAmount =
        patient.remaining_amount != null ? Number(patient.remaining_amount) : 0;

      const profit = price - totalCost;
      const profitMargin = price > 0 ? (profit / price) * 100 : 0;

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
        status: patient.status,
        price: price,
        paymentRemaining: remainingAmount,
        numberOfSteps: patient.number_of_steps,
        refinement: false,
        treatmentYear: patient.treatment_year, // Add treatment_year from DB
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
          totalDirectCost,
        },
        totalCost,
        profit,
        profitMargin,
        allocatedFixedCost, // Add allocated fixed cost to response
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
