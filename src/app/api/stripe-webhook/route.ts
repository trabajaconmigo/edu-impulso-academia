// app/api/stripe-webhook/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabaseClient"; // Ensure this is correctly configured

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15" as Stripe.LatestApiVersion,
});

// Disable body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: Request) {
  try {
    // Read raw request body as a Buffer
    const buf = Buffer.from(await request.arrayBuffer());
    const sig = request.headers.get("stripe-signature") || "";

    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
    }

    // Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const courseId = session.metadata?.courseId;
      const userId = session.metadata?.userId;
      const amount = session.amount_total ? session.amount_total / 100 : null;

      if (!courseId || !userId) {
        console.error("Missing metadata: courseId or userId is undefined", { courseId, userId });
      } else {
        // Insert a new purchase record into Supabase
        const { data, error } = await supabase.from("purchases").insert({
          user_id: userId,
          course_id: courseId,
          payment_id: session.id,
          amount: amount,
          purchased_at: new Date().toISOString(),
        });

        if (error) {
          console.error("Error inserting purchase into Supabase:", error.message);
        } else {
          console.log("Purchase recorded successfully:", data);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Unexpected error in webhook handler:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
