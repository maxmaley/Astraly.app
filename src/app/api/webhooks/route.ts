// Legacy webhook stub — Paddle webhooks are handled at /api/webhooks/paddle
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ received: true });
}
