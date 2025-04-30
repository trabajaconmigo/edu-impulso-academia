"use client";

import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { supabase } from "@/lib/supabaseClient";
import styles from "./CheckoutForm.module.css";

interface CheckoutFormProps {
  courseId: string;
  amountCents: number;
}

export default function CheckoutForm({
  courseId,
  amountCents,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setErrorMsg("");

    // 1) Crear PaymentIntent con courseId y amountCents
    const res = await fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, amountCents }),
    });
    const { clientSecret, error } = await res.json();
    if (error || !clientSecret) {
      setErrorMsg(error || "No se recibió clientSecret");
      setLoading(false);
      return;
    }

    // 2) Confirmar pago con tarjeta
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)!,
      },
    });

    if (result.error) {
      setErrorMsg(result.error.message || "Error en el pago con tarjeta");
      setLoading(false);
      return;
    }

    if (result.paymentIntent?.status === "succeeded") {
      // 3) Guardar la compra en tu BD
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setErrorMsg("Sesión expirada, vuelve a iniciar sesión.");
        setLoading(false);
        return;
      }

      await fetch("/api/save-purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          courseId,
          paymentId: result.paymentIntent.id,
          amount: result.paymentIntent.amount / 100,
        }),
      });

      // 4) Redirigir al perfil
      window.location.href = "/felicidades";
    }
  };

  return (
    <div className={styles.cardPaymentBox}>
      <h3 className={styles.paymentTitle}>Pago con Tarjeta</h3>
      <form onSubmit={handleSubmit} className={styles.paymentForm}>
        <div className={styles.cardElementWrapper}>
          <CardElement options={{ hidePostalCode: true }} />
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
