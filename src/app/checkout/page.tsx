"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { supabase } from "@/lib/supabaseClient";

import CheckoutForm from "./CheckoutForm";
import OxxoPaymentForm from "./OxxoPaymentForm";
import UserLoginRegistrationForm from "./UserLoginRegistrationForm";
import styles from "./page.module.css";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");

  const [courseTitle, setCourseTitle] = useState<string>("");
  const [amountCents, setAmountCents] = useState<number>(0);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;
    async function fetchCourse() {
      // 1) Sesión de usuario
      const { data: sessionData } = await supabase.auth.getSession();
      setLoggedIn(!!sessionData.session);

      // 2) Obtener título y precio con descuento
      const { data: course, error } = await supabase
        .from("courses")
        .select("title, price, discount_percentage, discount_active")
        .eq("id", courseId)
        .single();
      if (!error && course) {
        setCourseTitle(course.title);
        const hasDiscount =
          course.discount_active && course.discount_percentage > 0;
        const finalPrice = hasDiscount
          ? course.price * (1 - course.discount_percentage / 100)
          : course.price;
        setAmountCents(Math.round(finalPrice * 100));
      }

      setLoading(false);
    }
    fetchCourse();
  }, [courseId]);

  if (!courseId) {
    return <div className={styles.container}>ID de curso faltante.</div>;
  }
  if (loading || loggedIn === null) {
    return <div className={styles.container}>Cargando datos…</div>;
  }

  const displayAmount = amountCents / 100;

  if (!loggedIn) {
    return (
      <div className={styles.container}>
        <UserLoginRegistrationForm
          onLoginSuccess={() => setLoggedIn(true)}
          courseId={courseId}
          amount={displayAmount}
        />
      </div>
    );
  }

  return (
    <div className={styles.checkoutBox}>
      <h1 className={styles.checkoutTitle}>Finalizar Compra</h1>
      <p className={styles.checkoutSubtitle}>
        Estás comprando: <strong>{courseTitle}</strong>
      </p>
      <p className={styles.checkoutPrice}>
        Total a pagar: <strong>MX${displayAmount.toFixed(2)}</strong>
      </p>

      <Elements stripe={stripePromise}>
        <div className={styles.paymentMethods}>
          <CheckoutForm courseId={courseId} />
          <OxxoPaymentForm courseId={courseId} />
        </div>
      </Elements>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className={styles.loading}>Cargando checkout...</div>}>
      <CheckoutPageContent />
    </Suspense>
  );
}