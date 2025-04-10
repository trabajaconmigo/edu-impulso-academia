import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(request: Request) {
  const { userId, courseId, paymentId, amount } = await request.json();
  // In this scenario, "amount" is already 200.00 (not 20000)
  // because we did (amountCents / 100) on the front-end.

  const { error } = await supabase.from("purchases").insert({
    user_id: userId,
    course_id: courseId,
    payment_id: paymentId,
    amount: amount, // 200.00
    purchased_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
