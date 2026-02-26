import { NextRequest, NextResponse } from "next/server";
import { calculateCalendarMonth } from "@/lib/astro/calendar";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const year   = parseInt(params.get("year")  ?? String(new Date().getFullYear()), 10);
  const month  = parseInt(params.get("month") ?? String(new Date().getMonth() + 1), 10);

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    return NextResponse.json({ error: "Invalid year/month" }, { status: 400 });
  }

  try {
    const days = calculateCalendarMonth(year, month);
    return NextResponse.json({ year, month, days }, {
      headers: {
        // Cache for 6 hours — celestial events don't change
        "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[calendar] Calculation failed:", msg);
    return NextResponse.json({ error: "Calculation failed" }, { status: 500 });
  }
}
