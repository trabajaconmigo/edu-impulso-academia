import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15" as Stripe.LatestApiVersion,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Expect: courseId, courseSlug, courseTitle, coursePrice, userId
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
      // Redirect the user to their profile page after successful purchase.
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/perfil?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cursos/${courseSlug}`,
      metadata: {
        courseId,
        courseSlug,
        userId, // must pass the logged-in user's ID
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Error creating checkout session:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
