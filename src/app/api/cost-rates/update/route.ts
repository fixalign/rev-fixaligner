import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { ResultSetHeader } from "mysql2/promise";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, variable, direct, fixed } = body;

    if (!year || !variable || !direct || !fixed) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 }
      );
    }

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Get or create year
      const [yearRows] = await connection.query(
        "SELECT id FROM cost_rate_years WHERE year = ?",
        [year]
      );

      let yearId: number;

      if (Array.isArray(yearRows) && yearRows.length > 0) {
        yearId = (yearRows[0] as { id: number }).id;
      } else {
        const [insertResult] = await connection.query<ResultSetHeader>(
          "INSERT INTO cost_rate_years (year, created_at, updated_at) VALUES (?, NOW(), NOW())",
          [year]
        );
        yearId = insertResult.insertId;
      }

      // Update or insert variable rates
      const [existingVariable] = await connection.query(
        "SELECT id FROM variable_cost_rates WHERE year_id = ?",
        [yearId]
      );

      if (Array.isArray(existingVariable) && existingVariable.length > 0) {
        await connection.query(
          `UPDATE variable_cost_rates 
           SET sheet_rate = ?, case_rate = ?, resin_rate = ?, bag_rate = ?, box_rate = ?, updated_at = NOW()
           WHERE year_id = ?`,
          [
            variable.sheetRate,
            variable.caseRate,
            variable.resinRate,
            variable.bagRate,
            variable.boxRate,
            yearId,
          ]
        );
      } else {
        await connection.query(
          `INSERT INTO variable_cost_rates (year_id, sheet_rate, case_rate, resin_rate, bag_rate, box_rate, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            yearId,
            variable.sheetRate,
            variable.caseRate,
            variable.resinRate,
            variable.bagRate,
            variable.boxRate,
          ]
        );
      }

      // Update or insert direct rates
      const [existingDirect] = await connection.query(
        "SELECT id FROM direct_cost_rates WHERE year_id = ?",
        [yearId]
      );

      if (Array.isArray(existingDirect) && existingDirect.length > 0) {
        await connection.query(
          `UPDATE direct_cost_rates 
           SET design_rate = ?, alcohol_rate = ?, tissues_rate = ?, tools_rate = ?, updated_at = NOW()
           WHERE year_id = ?`,
          [
            direct.designRate,
            direct.alcoholRate,
            direct.tissuesRate,
            direct.toolsRate,
            yearId,
          ]
        );
      } else {
        await connection.query(
          `INSERT INTO direct_cost_rates (year_id, design_rate, alcohol_rate, tissues_rate, tools_rate, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            yearId,
            direct.designRate,
            direct.alcoholRate,
            direct.tissuesRate,
            direct.toolsRate,
          ]
        );
      }

      // Update or insert fixed costs
      const [existingFixed] = await connection.query(
        "SELECT id FROM fixed_costs WHERE year_id = ?",
        [yearId]
      );

      if (Array.isArray(existingFixed) && existingFixed.length > 0) {
        await connection.query(
          `UPDATE fixed_costs 
           SET rent = ?, utilities = ?, salaries = ?, internet = ?, updated_at = NOW()
           WHERE year_id = ?`,
          [fixed.rent, fixed.utilities, fixed.salaries, fixed.internet, yearId]
        );
      } else {
        await connection.query(
          `INSERT INTO fixed_costs (year_id, rent, utilities, salaries, internet, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
          [yearId, fixed.rent, fixed.utilities, fixed.salaries, fixed.internet]
        );
      }

      await connection.commit();
      connection.release();

      return NextResponse.json({
        success: true,
        message: "Cost rates updated successfully",
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update cost rates",
      },
      { status: 500 }
    );
  }
}
