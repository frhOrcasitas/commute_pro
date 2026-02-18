import { NextResponse } from "next/server";
import pool from "../../lib/db";

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      user_id,
      date,
      start_time,
      end_time,
      duration_minutes,
      start_location,
      end_location,
      start_lat,
      start_lng,
      end_lat,
      end_lng,
      traffic_level,
      notes,
    } = body;

    const values = [
      user_id ?? null,
      date ?? null,
      start_time ?? null,
      end_time ?? null,
      duration_minutes ?? null,
      start_location ?? null,
      end_location ?? null,
      start_lat ?? null,
      start_lng ?? null,
      end_lat ?? null,
      end_lng ?? null,
      traffic_level ?? null,
      notes ?? null,
    ];

    const [result] = await pool.execute(
      `INSERT INTO tbl_commutes 
      (user_id, date, start_time, end_time, duration_minutes,
      start_location, end_location,
      start_lat, start_lng, end_lat, end_lng,
      traffic_level, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      values
    );

    return NextResponse.json({
      message: "Commute created",
      id: result.insertId,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create commute" },
      { status: 500 }
    );
  }
}


export async function GET() {
    try {
        const [rows] = await pool.execute(
            "SELECT * FROM tbl_commutes ORDER BY created_at DESC"
        );

        return NextResponse.json(rows);
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: "Failed to fetch commutes"}, {status: 500});
    }
}

export async function DELETE(req) {
    try {
        const { id } = await req.json();

        await pool.execute("DELETE FROM tbl_commutes WHERE id = ?", [id]);

        return NextResponse.json({message: "Deleted Successfully" });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to delete commute" }, { status: 500 });
    }
}