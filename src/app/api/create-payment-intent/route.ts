import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabaseClient";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

export async function POST(request: Request) {
  try {
    const { courseId, amountCents } = await request.json();

    // Si amountCents no viene como número, lo recalculamos
    let cents = amountCents as number;
    if (typeof cents !== "number") {
      const { data: course, error } = await supabase
        .from("courses")
        .select("price, discount_percentage, discount_active")
        .eq("id", courseId)
        .single();
      if (error || !course) {
        return NextResponse.json(
          { error: "Curso no encontrado" },
          { status: 404 }
        );
      }
      const hasDiscount =
        course.discount_active && course.discount_percentage > 0;
      const finalPrice = hasDiscount
        ? course.price * (1 - course.discount_percentage / 100)
        : course.price;
      cents = Math.round(finalPrice * 100);
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: cents,
      currency: "mxn",
      metadata: { courseId },
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err: any) {
    console.error("Error creando PaymentIntent:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
