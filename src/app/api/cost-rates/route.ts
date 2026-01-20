import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

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
  legal: number;
  accountant_and_audit: number;
  cmo: number;
  monthly_capacity_hours: number;
}

export async function GET() {
  try {
    // Fetch all years
    const [years] = await pool.query<CostRateYear[]>(
      "SELECT * FROM cost_rate_years ORDER BY year ASC"
    );

    // Fetch all rates for all years
    const [variableRates] = await pool.query<VariableCostRate[]>(
      "SELECT * FROM variable_cost_rates"
    );
    const [directRates] = await pool.query<DirectCostRate[]>(
      "SELECT * FROM direct_cost_rates"
    );
    const [fixedCosts] = await pool.query<FixedCost[]>(
      "SELECT * FROM fixed_costs"
    );

    // Build the yearly rates object
    const yearlyRates: Record<
      number,
      {
        variable: Record<string, number>;
        direct: Record<string, number>;
        fixed: Record<string, number>;
      }
    > = {};

    years.forEach((yearRow) => {
      const variable = variableRates.find((v) => v.year_id === yearRow.id);
      const direct = directRates.find((d) => d.year_id === yearRow.id);
      const fixed = fixedCosts.find((f) => f.year_id === yearRow.id);

      yearlyRates[yearRow.year] = {
        variable: {
          sheetRate: Number(variable?.sheet_rate || 8),
          caseRate: Number(variable?.case_rate || 45),
          resinRate: Number(variable?.resin_rate || 120),
          bagRate: Number(variable?.bag_rate || 0.5),
          boxRate: Number(variable?.box_rate || 15),
        },
        direct: {
          designRate: Number(direct?.design_rate || 150),
          alcoholRate: Number(direct?.alcohol_rate || 10),
          tissuesRate: Number(direct?.tissues_rate || 5),
          toolsRate: Number(direct?.tools_rate || 20),
        },
        fixed: {
          rent: Number(fixed?.rent || 5000),
          utilities: Number(fixed?.utilities || 800),
          salaries: Number(fixed?.salaries || 15000),
          internet: Number(fixed?.internet || 200),
          legal: Number(fixed?.legal || 500),
          accountant_and_audit: Number(fixed?.accountant_and_audit || 1000),
          cmo: Number(fixed?.cmo || 5000),
          monthlyCapacityHours: Number(
            fixed?.monthly_capacity_hours != null
              ? fixed.monthly_capacity_hours
              : 192
          ),
          totalFixedCost:
            Number(fixed?.rent || 5000) +
            Number(fixed?.utilities || 800) +
            Number(fixed?.salaries || 15000) +
            Number(fixed?.internet || 200) +
            Number(fixed?.legal || 500) +
            Number(fixed?.accountant_and_audit || 1000) +
            Number(fixed?.cmo || 5000),
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: yearlyRates,
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch cost rates",
      },
      { status: 500 }
    );
  }
}
