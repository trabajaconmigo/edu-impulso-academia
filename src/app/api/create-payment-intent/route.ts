import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2022-11-15" as Stripe.LatestApiVersion,
});

export async function POST(request: Request) {
  try {
    const { courseId, amountCents } = await request.json();
    // e.g. courseId="xxx", amountCents=20000
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents, // do NOT multiply by 100 again
      currency: "mxn",
      description: `Compra de curso: ${courseId}`,
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
