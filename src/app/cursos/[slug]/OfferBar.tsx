/* src/app/cursos/[slug]/OfferBar.tsx */
"use client";

import React, { useEffect, useState } from "react";
import styles from "./OfferBar.module.css";

interface OfferBarProps {
  discountActive: boolean;
  expiresAt: string | null; // ISO datetime
}

export default function OfferBar({ discountActive, expiresAt }: OfferBarProps) {
  // If no discount at all, still show basket on mobile
  if (!discountActive) {
    return (
      <div className={styles.mobileBasket}>
        {/* your basket SVG / BuyButton here */}
      </div>
    );
  }

  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    if (!expiresAt) return;
    const end = new Date(expiresAt).getTime();
    const tick = () => {
      const diff = end - Date.now();
      if (diff <= 0) {
        setRemaining("¡Oferta finalizada!");
        return clearInterval(interval);
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${h}h ${m}m ${s}s`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <div className={styles.offerBar}>
      <span>Oferta expira en {remaining}</span>
    </div>
  );
}
