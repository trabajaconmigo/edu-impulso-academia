// src/app/checkout/page.tsx
"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm"; // Your card payment form component
import OxxoPaymentForm from "./OxxoPaymentForm"; // Your OXXO payment component

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const amountParam = searchParams.get("amount");
  const amount = amountParam ? Number(amountParam) : 0;

  if (!courseId || !amount) {
    return <div>Missing course details</div>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Checkout</h1>
      <Elements stripe={stripePromise}>
        <CheckoutForm courseId={courseId} amount={amount} />
        <OxxoPaymentForm courseId={courseId} amount={amount} />
      </Elements>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading checkout...</div>}>
      <CheckoutPageContent />
    </Suspense>
  );
}
