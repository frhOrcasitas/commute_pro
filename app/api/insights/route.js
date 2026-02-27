export async function POST(req) {
  try {
    const { commutes } = await req.json();

    if (!commutes || commutes.length === 0) {
      return new Response(JSON.stringify({ insight: "No data yet. Log a few commutes!" }));
    }

    // 1. Find the worst commute (longest duration)
    const worst = commutes.reduce((max, c) => 
      c.duration_minutes > max.duration_minutes ? c : max, commutes[0]
    );

    // 2. Identify the day of the week
    const worstDate = new Date(worst.date_commuted);
    const dayName = worstDate.toLocaleDateString('en-PH', { weekday: 'long' });

    // 3. Create a logic-based tip
    const insight = `Data Update: Your ${dayName} commutes are the longest (${worst.duration_minutes} mins). Try leaving 15-20 mins earlier than ${worst.start_time} to beat the peak!`;

    return new Response(JSON.stringify({ insight }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ insight: "Error calculating stats." }), { status: 500 });
  }
}