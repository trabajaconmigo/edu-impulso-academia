// app/api/create-payment-intent/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15" as Stripe.LatestApiVersion,
});

export async function POST(request: Request) {
  const { courseId, amount } = await request.json();

  // You can add metadata here, like courseId, userId, etc.
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "usd",
    metadata: { courseId },
  });

  return NextResponse.json({ clientSecret: paymentIntent.client_secret });
}
