// src/app/checkout/OxxoPaymentForm.tsx
"use client";

import React, { useState } from "react";
import { useStripe } from "@stripe/react-stripe-js";
import styles from "./OxxoPaymentForm.module.css";

interface OxxoPaymentFormProps {
  courseId: string;
}

interface OxxoNextAction {
  oxxo_display_details?: {
    hosted_voucher_url?: string;
  };
}

export default function OxxoPaymentForm({ courseId }: OxxoPaymentFormProps) {
  const stripe = useStripe();
  const [loading, setLoading] = useState<boolean>(false);
  const [voucherUrl, setVoucherUrl] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleOxxoPayment = async () => {
    setLoading(true);
    setErrorMsg("");

    // 1) Crear PaymentIntent para OXXO con sólo courseId
    const res = await fetch("/api/create-payment-intent-oxxo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });
    const { clientSecret, error } = await res.json();
    if (error || !clientSecret) {
      setErrorMsg(error || "No se recibió clientSecret");
      setLoading(false);
      return;
    }

    // 2) Confirmar pago OXXO
    const result = await stripe!.confirmOxxoPayment(clientSecret, {
      payment_method: {
        billing_details: {
          name: "Cliente OXXO",
          email: "cliente@example.com",
        },
      },
    });

    if (result.error) {
      setErrorMsg(result.error.message || "Error en el pago OXXO");
    } else if (result.paymentIntent) {
      const nextAction = result.paymentIntent.next_action as OxxoNextAction;
      const url = nextAction.oxxo_display_details?.hosted_voucher_url;
      if (url) {
        setVoucherUrl(url);
      } else {
        setErrorMsg("No se recibió el comprobante. Intenta de nuevo.");
      }
    }

    setLoading(false);
  };

  return (
    <div className={styles.oxxoPaymentBox}>
      <h3 className={styles.paymentTitle}>Pago con OXXO</h3>
      {voucherUrl ? (
        <div className={styles.voucherArea}>
          <p>Para completar tu pago, muestra este comprobante en OXXO:</p>
          <a
            href={voucherUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.voucherLink}
          >
            Ver Comprobante
          </a>
          <p>Tu curso se activará cuando OXXO confirme el pago.</p>
        </div>
      ) : (
        <>
          <button
            onClick={handleOxxoPayment}
            disabled={loading}
            className={styles.oxxoButton}
          >
            {loading ? "Procesando..." : "Generar Comprobante OXXO"}
          </button>
          {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}
        </>
      )}
    </div>
  );
}
