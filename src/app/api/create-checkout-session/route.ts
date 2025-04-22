// src/app/api/checkout/session/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabaseClient";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15" as Stripe.LatestApiVersion,
});

export async function POST(request: Request) {
  try {
    // 👀 logueamos el body para verificar que llega bien
    const textBody = await request.clone().text();
    console.log("[checkout] request.body:", textBody);
    const { courseId, userId } = JSON.parse(textBody);

    // 1. Traer datos del curso
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select(
        "price, discount_percentage, discount_active, slug, title"
      )
      .eq("id", courseId)
      .single();

    if (courseError || !course) {
      console.error("[checkout] curso no encontrado:", courseError);
      return NextResponse.json(
        { error: "Curso no encontrado" },
        { status: 404 }
      );
    }

    // 2. Calcular precio final
    const hasValidDiscount =
      course.discount_active && course.discount_percentage > 0;
    const finalPrice = hasValidDiscount
      ? course.price * (1 - course.discount_percentage / 100)
      : course.price;

    const unitAmount = Math.round(finalPrice * 100);
    if (typeof unitAmount !== "number") {
      throw new Error("unitAmount no es número");
    }
    console.log("[checkout] unitAmount:", unitAmount);

    // 3. Crear sesión de Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "mxn",
            product_data: { name: course.title },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/perfil?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cursos/${course.slug}`,
      metadata: { courseId, userId },
    });

    // 4. Respondemos JSON puro
    return NextResponse.json(
      { sessionId: session.id, url: session.url },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[checkout] excepción:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
