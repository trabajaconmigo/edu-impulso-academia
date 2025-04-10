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
  // useSearchParams() is now safely wrapped in Suspense below
  const searchParams = useSearchParams();
  
  // For this example, we expect the URL to be like:
  // /checkout?courseId=xxxx&amount=20000   where amount is in cents (20000 = MX$200.00)
  const courseId = searchParams.get("courseId");
  const rawAmount = searchParams.get("amount");
  const amountCents = rawAmount ? Number(rawAmount) : 0;
  const displayAmount = amountCents / 100; // convert cents to pesos

  const [courseTitle, setCourseTitle] = useState<string>("");
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [loadingCourse, setLoadingCourse] = useState(true);

  useEffect(() => {
    async function checkSessionAndCourse() {
      // Check user session
      const { data } = await supabase.auth.getSession();
      setLoggedIn(!!data.session);

      // Fetch course title from your "courses" table
      if (courseId) {
        const { data: courseData, error } = await supabase
          .from("courses")
          .select("title")
          .eq("id", courseId)
          .single();

        if (!error && courseData) {
          setCourseTitle(courseData.title);
        }
      }
      setLoadingCourse(false);
    }
    checkSessionAndCourse();
  }, [courseId]);

  if (!courseId || !amountCents) {
    return <div className={styles.container}>Faltan datos del curso o el precio.</div>;
  }

  if (loadingCourse || loggedIn === null) {
    return <div className={styles.container}>Cargando datos de curso y sesión...</div>;
  }

  // If the user is not logged in, show a message or inline login form.
  if (loggedIn === false) {
    return (
      <div className={styles.container}>
        <h2>Necesitas iniciar sesión para comprar este curso.</h2>
        <p>Por favor, inicia sesión o crea una cuenta.</p>
        {/* Optionally, you can render <UserLoginRegistrationForm /> here */}
      </div>
    );
  }

  // User is logged in, show checkout details.
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
