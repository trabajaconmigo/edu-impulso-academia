// app/checkout/OxxoPaymentForm.tsx
"use client";

import { useState } from "react";
import { useStripe } from "@stripe/react-stripe-js";

interface OxxoPaymentFormProps {
  courseId: string;
  amount: number;
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
      // Create a PaymentIntent for OXXO on your server
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

      // Confirm the PaymentIntent with OXXO
      const result = await stripe!.confirmOxxoPayment(clientSecret, {
        payment_method: {
          billing_details: {
            name: "Customer Name",
            email: "customer@example.com",
          },
        },
      });

      if (result.error) {
        setErrorMsg(result.error.message || "Payment failed");
      } else if (result.paymentIntent) {
        // Cast next_action to any to access oxxo_display_details
        const nextAction = result.paymentIntent.next_action as any;
        const voucher = nextAction?.oxxo_display_details?.hosted_voucher_url;
        if (voucher) {
          setVoucherUrl(voucher);
        } else {
          setErrorMsg("No voucher information received. It might take a few moments for voucher details to become available.");
        }
      }
    } catch (err) {
      setErrorMsg("Error processing OXXO payment");
    }
    setLoading(false);
  }

  return (
    <div style={{ marginTop: "1rem" }}>
      <button onClick={handleOxxoPayment} disabled={loading}>
        {loading ? "Processing..." : "Pagar con OXXO"}
      </button>
      {errorMsg && <div style={{ color: "red" }}>{errorMsg}</div>}
      {voucherUrl && (
        <div style={{ marginTop: "1rem" }}>
          <p>Para completar el pago, visita una tienda OXXO y muestra este comprobante:</p>
          <a href={voucherUrl} target="_blank" rel="noopener noreferrer">
            Ver comprobante de pago
          </a>
        </div>
      )}
    </div>
  );
}
