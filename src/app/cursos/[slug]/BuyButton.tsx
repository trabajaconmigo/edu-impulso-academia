"use client";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function BuyButton({ course }: { course: any }) {
  const [loading, setLoading] = useState(false);

  async function handleBuy() {
    setLoading(true);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course.id,
          courseTitle: course.title,
          coursePrice: course.price,
        }),
      });

      const data = await res.json();
      if (data.sessionId) {
        const stripe = await stripePromise;
        if (stripe) {
          await stripe.redirectToCheckout({ sessionId: data.sessionId });
        }
      }
    } catch (err) {
      console.error("Error initiating checkout", err);
    }
    setLoading(false);
  }

  return (
    <button
      onClick={handleBuy}
      disabled={loading}
      style={{
        padding: "0.8rem 1.5rem",
        backgroundColor: "#a435f0",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
      }}
    >
      {loading ? "Procesando..." : "Comprar"}
    </button>
  );
}
