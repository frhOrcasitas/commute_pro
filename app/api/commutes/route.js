import { NextResponse } from "next/server";
import supabase from "../../lib/supabase";

/* ================= CREATE ================= */
export async function POST(req) {
  try {
    const body = await req.json();

    const {
      user_id,
      date_commuted,
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

    const { data, error } = await supabase
      .from("tbl_commutes")
      .insert([
        {
          user_id,
          date_commuted,
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
        },
      ])
      .select();
    
    if (error) throw error;

    return NextResponse.json({
      message: "Commute created",
      data,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create commute" },
      { status: 500 }
    );
  }
}

/* ================= READ ================= */
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("tbl_commutes")
      .select("*")
      .order("created_at", { ascending: false});
      
      if (error) throw error;

    return NextResponse.json(data);

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch commutes" },
      { status: 500 }
    );
  }
}

/* ================= DELETE ================= */
export async function DELETE(req) {
  try {
    const { id } = await req.json();

    const {error} = await supabase
      .from("tbl_commutes")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ message: "Deleted successfully" });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete commute" },
      { status: 500 }
    );
  }
}
