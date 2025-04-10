"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import { supabase } from "@/lib/supabaseClient";
import CheckoutForm from "./CheckoutForm";
import OxxoPaymentForm from "./OxxoPaymentForm";
import styles from "./page.module.css";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  // Query param => e.g. courseId=214ede3e-f227-49a1-9d85-69048aabb8ba
  const courseId = searchParams.get("courseId");
  // e.g. amount=20000 => 200.00 in pesos
  const rawAmount = searchParams.get("amount");
  const amountCents = rawAmount ? Number(rawAmount) : 0;
  const displayAmount = amountCents / 100; // e.g. 200.00

  // We'll fetch the course name from Supabase
  const [courseTitle, setCourseTitle] = useState<string>("");
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [loadingCourse, setLoadingCourse] = useState(true);

  useEffect(() => {
    async function checkSessionAndCourse() {
      // 1) Check user session
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setLoggedIn(true);
      } else {
        setLoggedIn(false);
      }

      // 2) Fetch course name
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

  // Validate we have valid query params
  if (!courseId || !amountCents) {
    return (
      <div className={styles.container}>
        Faltan datos del curso o el precio.
      </div>
    );
  }

  // If still loading the course name or session check, show a spinner
  if (loadingCourse || loggedIn === null) {
    return (
      <div className={styles.container}>
        Cargando datos de curso y sesión...
      </div>
    );
  }

  // If user is not logged in, you can either show a custom login form or a simple message
  if (loggedIn === false) {
    return (
      <div className={styles.container}>
        <h2>Necesitas iniciar sesión para comprar este curso.</h2>
        <p>Por favor, inicia sesión o crea una cuenta.</p>
        {/* Optionally, inline <UserLoginRegistrationForm /> */}
      </div>
    );
  }

  // Logged in, show the final purchase details
  return (
    <Suspense fallback={<div>Cargando Checkout...</div>}>
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
    </Suspense>
  );
}
