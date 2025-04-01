import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabaseClient";
import { Buffer } from "buffer"; // Import Buffer explicitly

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15" as Stripe.LatestApiVersion,
});


export const config = {
  api: {
    bodyParser: false, // Disable automatic body parsing so we can get the raw body
  },
};

export async function POST(request: Request) {
  // Retrieve the raw body as a buffer
  const buf = Buffer.from(await request.arrayBuffer());
  const sig = request.headers.get("stripe-signature") || "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error("Webhook signature verification failed:", error.message);
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  // Process the checkout session completion event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Ensure metadata contains courseId and userId
    const courseId = session.metadata?.courseId;
    const userId = session.metadata?.userId;
    const amount = session.amount_total ? session.amount_total / 100 : null;

    if (!courseId || !userId) {
      console.error("Missing courseId or userId in metadata.", { courseId, userId });
    } else {
      // Insert the purchase record into Supabase
      const { error } = await supabase.from("purchases").insert({
        user_id: userId,
        course_id: courseId,
        payment_id: session.id,
        amount: amount,
        purchased_at: new Date().toISOString(),
      });
      if (error) {
        console.error("Error inserting purchase:", error.message);
      } else {
        console.log("Purchase inserted successfully for course:", courseId);
      }
    }
  }

  // Return a response to acknowledge receipt of the event
  return NextResponse.json({ received: true });
}
