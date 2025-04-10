"use client";

import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { supabase } from "@/lib/supabaseClient";
import styles from "./CheckoutForm.module.css";

interface CheckoutFormProps {
  courseId: string;
  amountCents: number; // e.g. 20000 => 200.00 MXN
}

export default function CheckoutForm({ courseId, amountCents }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setErrorMsg("");

    // Create PaymentIntent on server
    const res = await fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId,
        // We pass the raw cents, e.g. 20000
        amountCents,
      }),
    });
    const { clientSecret, error } = await res.json();
    if (error) {
      setErrorMsg("Error creando PaymentIntent: " + error);
      setLoading(false);
      return;
    }

    // confirm card payment
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)!,
      },
    });

    if (result.error) {
      setErrorMsg(result.error.message || "Error en el pago con tarjeta");
      setLoading(false);
    } else if (result.paymentIntent && result.paymentIntent.status === "succeeded") {
      // Check user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setErrorMsg("La sesión expiró, por favor inicia sesión de nuevo.");
        setLoading(false);
        return;
      }
      // Insert purchase into DB (in pesos, e.g. 200.00)
      await fetch("/api/save-purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          courseId,
          paymentId: result.paymentIntent.id,
          // We store real pesos, so divide by 100 => 200.00
          amount: amountCents / 100,
        }),
      });

      // redirect to perfil
      window.location.href = "/perfil";
    }
  }

  return (
    <div className={styles.cardPaymentBox}>
      <h3 className={styles.paymentTitle}>Pago con Tarjeta</h3>
      <form onSubmit={handleSubmit} className={styles.paymentForm}>
        <div className={styles.cardElementWrapper}>
          <CardElement />
        </div>
        {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}
        <button
          type="submit"
          disabled={!stripe || loading}
          className={styles.submitButton}
        >
          {loading ? "Procesando..." : "Pagar Ahora"}
        </button>
      </form>
    </div>
  );
}
