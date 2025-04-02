// app/checkout/CheckoutForm.tsx
"use client";

import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { supabase } from "@/lib/supabaseClient";

interface CheckoutFormProps {
  courseId: string;
  amount: number;
}

export default function CheckoutForm({ courseId, amount }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setErrorMsg("");

    // Create a PaymentIntent on your server
    const res = await fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, amount }),
    });
    const { clientSecret } = await res.json();

    // Confirm the card payment using Stripe Elements
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)!,
      },
    });

    if (result.error) {
      setErrorMsg(result.error.message || "Payment failed");
      setLoading(false);
    } else if (result.paymentIntent && result.paymentIntent.status === "succeeded") {
      // Retrieve the current session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setErrorMsg("User session expired, please log in again.");
        setLoading(false);
        return;
      }
      const userId = session.user.id;

      // Save the purchase in Supabase
      await fetch("/api/save-purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          courseId,
          paymentId: result.paymentIntent.id,
          amount,
        }),
      });

      // Redirect to profile on success
      window.location.href = "/perfil";
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      {errorMsg && <div style={{ color: "red" }}>{errorMsg}</div>}
      <button type="submit" disabled={!stripe || loading}>
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
}
