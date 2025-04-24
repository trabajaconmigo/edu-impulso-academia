import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  const { userId, courseId, paymentId, amount, viaReferral = false } =
    await req.json();

  const { error } = await supabase.from("purchases").insert({
    user_id: userId,
    course_id: courseId,
    payment_id: paymentId,
    amount,
    via_referral: viaReferral,
    purchased_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}
