// app/checkout/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm"; // Your card payment form component
import OxxoPaymentForm from "./OxxoPaymentForm"; // Your OXXO payment component

// Load your Stripe publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const amountParam = searchParams.get("amount");
  const amount = amountParam ? Number(amountParam) : 0;

  if (!courseId || !amount) {
    return <div>Missing course details</div>;
  }

  return (
    <Elements stripe={stripePromise}>
      <div style={{ padding: "2rem" }}>
        <h1>Checkout</h1>
        {/* Card Payment Option */}
        <CheckoutForm courseId={courseId} amount={amount} />
        {/* OXXO Payment Option */}
        <OxxoPaymentForm courseId={courseId} amount={amount} />
      </div>
    </Elements>
  );
}
