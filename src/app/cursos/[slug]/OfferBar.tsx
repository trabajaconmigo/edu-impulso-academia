/* ----------  <OfferBar>  ----------------------------------
   Fixed bottom urgency bar / FAB for the course page
----------------------------------------------------------- */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { FaShoppingCart } from "react-icons/fa";
import styles from "./OfferBar.module.css";

interface CourseLite {
  id: string;
  price: number;
  discount_percentage?: number | null;
  discount_active?: boolean | null;
  expires_at?: string | null;      // ISO timestamp
}

interface Props {
  course: CourseLite;
}

export default function OfferBar({ course }: Props) {
  const router = useRouter();

  /* ── 1. already purchased? ───────────────────────────── */
  const [owned, setOwned] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    async function run() {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return mounted && setOwned(false);

      const { data, error } = await supabase
        .from("purchases")
        .select("id")
        .eq("user_id", session.session.user.id)
        .eq("course_id", course.id)
        .single();

      if (mounted) setOwned(!error && !!data);
    }
    run();
    return () => {
      mounted = false;
    };
  }, [course.id]);

  /* ── 2. timer → seconds left until expires_at ────────── */
  const [secsLeft, setSecsLeft] = useState<number>(() => {
    if (!course.expires_at) return 0;
    const diff = new Date(course.expires_at).getTime() - Date.now();
    return diff > 0 ? Math.floor(diff / 1000) : 0;
  });

  useEffect(() => {
    if (!course.expires_at) return;
    const id = setInterval(() => {
      const diff = new Date(course.expires_at!).getTime() - Date.now();
      setSecsLeft(diff > 0 ? Math.floor(diff / 1000) : 0);
    }, 1000);
    return () => clearInterval(id);
  }, [course.expires_at]);

  const tH = String(Math.floor(secsLeft / 3600)).padStart(2, "0");
  const tM = String(Math.floor((secsLeft % 3600) / 60)).padStart(2, "0");
  const tS = String(secsLeft % 60).padStart(2, "0");
  const timeString = `${tH}:${tM}:${tS}`;

  /* ── 3. current payable amount (with discount if active) */
  const discountOk =
    course.discount_active && (course.discount_percentage ?? 0) > 0;
  const finalPrice = discountOk
    ? +(course.price * (1 - (course.discount_percentage ?? 0))).toFixed(2)
    : course.price;
  const amountCents = Math.round(finalPrice * 100);

  /* ── 4. click handler → checkout ─────────────────────── */
  const goCheckout = () =>
    router.push(`/checkout?courseId=${course.id}&amount=${amountCents}`);

  /* ── 5. visibility rules ─────────────────────────────── */
  if (owned) return null; // hide if user owns course

  const showDesktopBar = discountOk && secsLeft > 0;
  const showMobileBar = discountOk && secsLeft > 0;
  const showMobileFab = !discountOk || secsLeft <= 0;

  /* ── 6. render ───────────────────────────────────────── */
  return (
    <>
      {showDesktopBar && (
        <div className={styles.desktopBar}>
          ¡Oferta termina en&nbsp;<strong>{timeString}</strong>
        </div>
      )}

      {showMobileBar && (
        <div className={styles.mobileBar} onClick={goCheckout}>
          <FaShoppingCart className={styles.cartIcon} />
          <span>Termina en&nbsp;{timeString}</span>
        </div>
      )}

      {showMobileFab && (
        <button className={styles.fab} onClick={goCheckout}>
          <FaShoppingCart />
        </button>
      )}
    </>
  );
}
