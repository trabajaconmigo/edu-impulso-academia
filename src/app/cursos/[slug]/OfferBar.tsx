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
}

interface OfferBarProps {
  course: CourseLite;
}

const HOURS_LEFT = 4; // visual urgency → 4 h

export default function OfferBar({ course }: OfferBarProps) {
  const router = useRouter();

  /* ─── 1. Already purchased? ─────────────────────────────── */
  const [hasPurchased, setHasPurchased] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    async function check() {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return mounted && setHasPurchased(false);

      const { data, error } = await supabase
        .from("purchases")
        .select("id")
        .eq("user_id", session.session.user.id)
        .eq("course_id", course.id)
        .single();

      if (mounted) setHasPurchased(!error && !!data);
    }
    check();
    return () => {
      mounted = false;
    };
  }, [course.id]);

  /* ─── 2. Timer (hh:mm:ss) ───────────────────────────────── */
  const [secsLeft, setSecsLeft] = useState(HOURS_LEFT * 3600);
  useEffect(() => {
    const id = setInterval(() => setSecsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);
  const tH = String(Math.floor(secsLeft / 3600)).padStart(2, "0");
  const tM = String(Math.floor((secsLeft % 3600) / 60)).padStart(2, "0");
  const tS = String(secsLeft % 60).padStart(2, "0");
  const timeString = `${tH}:${tM}:${tS}`;

  /* ─── 3. Pricing (for checkout) ─────────────────────────── */
  const discountOk = course.discount_active && (course.discount_percentage ?? 0) > 0;
  const discounted =
    discountOk
      ? +(course.price * (1 - (course.discount_percentage ?? 0))).toFixed(2)
      : course.price;
  const amountCents = Math.round(discounted * 100);

  /* ─── 4. CTA navigation ─────────────────────────────────── */
  function goCheckout() {
    router.push(`/checkout?courseId=${course.id}&amount=${amountCents}`);
  }

  /* ─── 5. Visibility rules ───────────────────────────────── */
  if (hasPurchased) return null;

  const showDesktopBar = discountOk;      // only if discount
  const showMobileBar  = discountOk;      // full-width bar with basket
  const showMobileFab  = !discountOk;     // circle FAB when no discount

  /* ─── 6. Render ─────────────────────────────────────────── */
  return (
    <>
      {/* ===== Desktop fixed bar (only when discount) ===== */}
      {showDesktopBar && (
        <div className={styles.desktopBar}>
          <span className={styles.clockText}>
            ¡Oferta por tiempo limitado!  Termina en&nbsp;
            <strong>{timeString}</strong>
          </span>
        </div>
      )}

      {/* ===== Mobile full-width bar (discount) ===== */}
      {showMobileBar && (
        <div className={styles.mobileBar} onClick={goCheckout}>
          <FaShoppingCart className={styles.mobileIcon} />
          <span className={styles.mobileClock}>Termina en&nbsp;{timeString}</span>
        </div>
      )}

      {/* ===== Mobile floating basket (no discount) ===== */}
      {showMobileFab && (
        <button className={styles.fab} onClick={goCheckout}>
          <FaShoppingCart />
        </button>
      )}
    </>
  );
}
