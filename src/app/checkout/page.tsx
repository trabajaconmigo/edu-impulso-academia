"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { supabase } from "@/lib/supabaseClient";

import CheckoutForm from "./CheckoutForm";
import OxxoPaymentForm from "./OxxoPaymentForm";
import UserLoginRegistrationForm from "./UserLoginRegistrationForm"; // Your inline form
import styles from "./page.module.css";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutPageContent() {
  const searchParams = useSearchParams();

  // e.g. /checkout?courseId=abc&amount=20000
  const courseId = searchParams.get("courseId");
  const rawAmount = searchParams.get("amount");
  const amountCents = rawAmount ? Number(rawAmount) : 0;
  const displayAmount = amountCents / 100;

  const [courseTitle, setCourseTitle] = useState<string>("");
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [loadingCourse, setLoadingCourse] = useState(true);

  useEffect(() => {
    async function checkSessionAndCourse() {
      // 1) Check session
      const { data: sessionData } = await supabase.auth.getSession();
      setLoggedIn(!!sessionData.session);

      // 2) Fetch course title from "courses"
      if (courseId) {
        const { data: cData, error } = await supabase
          .from("courses")
          .select("title")
          .eq("id", courseId)
          .single();

        if (!error && cData) {
          setCourseTitle(cData.title);
        }
      }
      setLoadingCourse(false);
    }
    checkSessionAndCourse();
  }, [courseId]);

  if (!courseId || !amountCents) {
    return <div className={styles.container}>Faltan datos del curso o precio.</div>;
  }

  if (loadingCourse || loggedIn === null) {
    return <div className={styles.container}>Cargando datos de curso y sesión...</div>;
  }

  // If not logged in => show inline sign in / register form
  if (loggedIn === false) {
    return (
      <div className={styles.container}>
        <UserLoginRegistrationForm
          // Once user logs in, we set loggedIn to true => re-render => show payment forms
          onLoginSuccess={() => setLoggedIn(true)}
          courseId={courseId}
          // we can pass the displayAmount or the actual cents
          amount={displayAmount} // just to display in the form
        />
      </div>
    );
  }

  // Logged in => show payment
  return (
    <div className={styles.checkoutBox}>
      <h1 className={styles.checkoutTitle}>Finalizar Compra</h1>
      <p className={styles.checkoutSubtitle}>
        Estás comprando: <strong>{courseTitle || "Curso sin nombre"}</strong>
      </p>
      <p className={styles.checkoutPrice}>
        Total a pagar: <strong>MX${displayAmount.toFixed(2)}</strong>
      </p>

      <Elements stripe={stripePromise}>
        <div className={styles.paymentMethods}>
          <CheckoutForm courseId={courseId} amountCents={amountCents} />
          <OxxoPaymentForm courseId={courseId} amount={amountCents} />
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
