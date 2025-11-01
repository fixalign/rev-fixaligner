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

      if (variable && direct && fixed) {
        yearlyRates[yearRow.year] = {
          variable: {
            sheetRate: Number(variable.sheet_rate),
            caseRate: Number(variable.case_rate),
            resinRate: Number(variable.resin_rate),
            bagRate: Number(variable.bag_rate),
            boxRate: Number(variable.box_rate),
          },
          direct: {
            designRate: Number(direct.design_rate),
            alcoholRate: Number(direct.alcohol_rate),
            tissuesRate: Number(direct.tissues_rate),
            toolsRate: Number(direct.tools_rate),
          },
          fixed: {
            rent: Number(fixed.rent),
            utilities: Number(fixed.utilities),
            salaries: Number(fixed.salaries),
            internet: Number(fixed.internet),
            totalFixedCost:
              Number(fixed.rent) +
              Number(fixed.utilities) +
              Number(fixed.salaries) +
              Number(fixed.internet),
          },
        };
      }
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
