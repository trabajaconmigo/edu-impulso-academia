// src/app/api/create-checkout-session/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15',
});

export async function POST(request: Request) {
  try {
    const { courseId, courseTitle, coursePrice, couponCode } = await request.json();

    // You can further validate inputs or fetch course details from Supabase here.

    // Create a new Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'mxn', // or your preferred currency
            product_data: {
              name: courseTitle,
            },
            unit_amount: Math.round(coursePrice * 100), // Stripe requires amount in cents
          },
          quantity: 1,
        },
      ],
      // Optionally, attach coupon details here if you want to integrate coupon logic
      success_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/cursos/${courseId}/exito?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/cursos/${courseId}`,
      metadata: {
        courseId,
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    console.error('Error creating Stripe checkout session:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
