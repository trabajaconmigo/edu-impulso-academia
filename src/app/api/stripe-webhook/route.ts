import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabaseClient";
import { Buffer } from "buffer";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15" as Stripe.LatestApiVersion,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: Request) {
  try {
    const buf = Buffer.from(await request.arrayBuffer());
    const sig = request.headers.get("stripe-signature") || "";

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        buf,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (unknownError) {
      // We capture the error as unknown, then narrow it if it's an instance of Error
      if (unknownError instanceof Error) {
        console.error("Webhook signature verification failed:", unknownError.message);
      }
      return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const courseId = session.metadata?.courseId;
      const userId = session.metadata?.userId;
      const amount = session.amount_total ? session.amount_total / 100 : null;

      if (!courseId || !userId) {
        console.error("Missing courseId or userId in metadata.", { courseId, userId });
      } else {
        const { error } = await supabase
          .from("purchases")
          .insert({
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

    return NextResponse.json({ received: true });
  } catch (unknownError) {
    if (unknownError instanceof Error) {
      console.error("Webhook error:", unknownError.message);
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
