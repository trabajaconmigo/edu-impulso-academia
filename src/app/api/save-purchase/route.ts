// app/api/save-purchase/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(request: Request) {
  const { userId, courseId, paymentId, amount } = await request.json();
  // Insert purchase into Supabase
  const { error } = await supabase.from("purchases").insert({
    user_id: userId,
    course_id: courseId,
    payment_id: paymentId,
    amount: amount / 100, // Convert to dollars if needed
    purchased_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
