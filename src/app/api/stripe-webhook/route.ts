// src/app/api/stripe-webhook/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15',
});

// Disable body parsing so we can access the raw payload
export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable: ReadableStream<Uint8Array>) {
  const chunks = [];
  const reader = readable.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  return Buffer.concat(chunks.map(chunk => Buffer.from(chunk)));
}

export async function POST(request: Request) {
  const buf = await buffer(request.body);
  const sig = request.headers.get('stripe-signature') || '';

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed.', err.message);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const courseId = session.metadata?.courseId;

    // TODO: Insert a record into the "purchases" table in Supabase using courseId and user info.
    console.log('Checkout Session Completed for course:', courseId);
  }

  return NextResponse.json({ received: true });
}
