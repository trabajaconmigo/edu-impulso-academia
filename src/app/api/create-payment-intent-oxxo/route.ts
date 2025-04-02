import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15" as Stripe.LatestApiVersion,
});

export async function POST(request: Request) {
  try {
    const { courseId, amount } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Create a PaymentIntent for OXXO in MXN currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // amount in cents (MXN)
      currency: "mxn",
      payment_method_types: ["oxxo"],
      metadata: { courseId },
    });

    console.log("Created PaymentIntent:", paymentIntent);
    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: unknown) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error("Error creating PaymentIntent:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
