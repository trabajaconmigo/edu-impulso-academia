import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15" as Stripe.LatestApiVersion,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Removed couponCode since it's unused
    const { courseId, courseSlug, courseTitle, coursePrice, userId } = body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "mxn",
            product_data: {
              name: courseTitle,
            },
            unit_amount: Math.round(coursePrice * 100), // amount in cents
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cursos/${courseSlug}/exito?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cursos/${courseSlug}`,
      metadata: {
        courseId,
        courseSlug,
        userId,
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    console.error("Error creating checkout session:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
