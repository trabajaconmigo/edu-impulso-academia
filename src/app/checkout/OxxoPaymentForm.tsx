"use client";

import { useState } from "react";
import { useStripe } from "@stripe/react-stripe-js";
import styles from "./OxxoPaymentForm.module.css";

interface OxxoPaymentFormProps {
  courseId: string;
  amount: number; // The amount in pesos, e.g. 150. Convert to cents in your PaymentIntent
}

interface OxxoDisplayDetails {
  hosted_voucher_url?: string;
}

interface OxxoNextAction {
  oxxo_display_details?: OxxoDisplayDetails;
}

export default function OxxoPaymentForm({ courseId, amount }: OxxoPaymentFormProps) {
  const stripe = useStripe();
  const [loading, setLoading] = useState(false);
  const [voucherUrl, setVoucherUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleOxxoPayment() {
    setLoading(true);
    setErrorMsg("");

    try {
      // Create PaymentIntent for OXXO
      const res = await fetch("/api/create-payment-intent-oxxo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, amount }),
      });
      const data = await res.json();
      const clientSecret = data.clientSecret;
      if (!clientSecret) {
        setErrorMsg("No client secret returned");
        setLoading(false);
        return;
      }

      // Confirm the OXXO payment
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
        // We do NOT store a purchase row yet. We wait for the Stripe webhook.
        const nextAction = result.paymentIntent.next_action as OxxoNextAction;
        const voucher = nextAction?.oxxo_display_details?.hosted_voucher_url;
        if (voucher) {
          setVoucherUrl(voucher);
        } else {
          setErrorMsg(
            "No se recibió el comprobante. Intenta de nuevo en unos minutos."
          );
        }
      }
    } catch (error) {
      console.error("Error OXXO:", error);
      setErrorMsg("Error procesando OXXO");
    }
    setLoading(false);
  }

  return (
    <div className={styles.oxxoPaymentBox}>
      <h3 className={styles.paymentTitle}>Pago con OXXO</h3>
      {voucherUrl ? (
        <div className={styles.voucherArea}>
          <p>
            Para completar tu pago, acude a una tienda OXXO y muestra el
            comprobante:
          </p>
          <a href={voucherUrl} target="_blank" rel="noopener noreferrer" className={styles.voucherLink}>
            Ver Comprobante
          </a>
          <p>
            Una vez que OXXO confirme tu pago, tu curso se activará
            automáticamente.
          </p>
          <p>
            Revisa tu perfil o tu correo. Podrías tener que esperar unos minutos.
          </p>
        </div>
      ) : (
        <>
          <button onClick={handleOxxoPayment} disabled={loading} className={styles.oxxoButton}>
            {loading ? "Procesando..." : "Generar Comprobante OXXO"}
          </button>
          {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}
        </>
      )}
    </div>
  );
}
