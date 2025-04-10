import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabaseClient";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2022-11-15" as Stripe.LatestApiVersion,
});

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return new Response("No signature", { status: 400 });
  }

  let event: Stripe.Event;
  const rawBody = await req.text(); // must read raw text as is

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook Error:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as Stripe.PaymentIntent;
    console.log("PaymentIntent succeeded for:", pi.id);

    // If it's an OXXO payment, you might have metadata that references courseId, userId, etc.
    // Or you can store the PaymentIntent in a separate table if you prefer.
    // For example, if you do something like:
    //  - courseId in PaymentIntent metadata
    //  - userId in PaymentIntent metadata
    // Then you can create or update your purchase row here.

    const metadata = pi.metadata || {};
    const courseId = metadata.courseId || null;
    const userId = metadata.userId || null;

    // If you haven't already inserted a "pending" row, you can do so now as "paid":
    if (courseId && userId) {
      const amount = pi.amount / 100; // convert cents to e.g. 150.00
      const paymentId = pi.id;

      // Insert into "purchases"
      const { error } = await supabase.from("purchases").insert({
        user_id: userId,
        course_id: courseId,
        payment_id: paymentId,
        amount,
        purchased_at: new Date().toISOString(),
      });
      if (error) {
        console.error("Error inserting OXXO purchase:", error.message);
      }
    } else {
      console.warn("No courseId/userId found in PaymentIntent metadata");
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
