// Lemon Squeezy webhook — will be implemented in Step 9
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ received: true });
}
