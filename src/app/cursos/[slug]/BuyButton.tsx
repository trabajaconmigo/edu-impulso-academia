/* --------------------------------------------------------------------
   src/app/components/BuyButton.tsx
-------------------------------------------------------------------- */
"use client";

import { useRouter } from "next/navigation";
import styles from "./BuyButton.module.css";

interface BuyButtonProps {
  course: {
    id: string;
    price: number;                 // precio base en MXN
    discount_percentage?: number;  // opcional
    discount_active?: boolean;     // opcional
  };
}

export default function BuyButton({ course }: BuyButtonProps) {
  const router = useRouter();

  /* -------------------------------------------------------------- */
  function computeFinalPrice(): number {
    const { price, discount_percentage = 0, discount_active = false } = course;
    if (discount_active && discount_percentage > 0) {
      return Number((price * (1 - discount_percentage / 100)).toFixed(2));
    }
    return price;
  }

  async function handleBuy() {
    // 1) Compute final price
    const finalMXN    = computeFinalPrice();       // e.g. 199.9
    const amountCents = Math.round(finalMXN * 100);

    // 2) Fire Meta-Pixel Purchase event (cast to any so TS stops complaining)
    if (typeof (window as any).fbq === "function") {
      (window as any).fbq("track", "Purchase", {
        value: finalMXN,
        currency: "MXN",
        content_ids: [course.id],
        content_type: "product",
      });
    }

    // 3) Navigate to your checkout flow
    router.push(
      `/checkout?courseId=${course.id}&amount=${amountCents}`
    );
  }

  /* -------------------------------------------------------------- */
  return (
    <button
      data-buy-button          /* For OfferBar auto-click */
      onClick={handleBuy}
      className={styles.buyButton}
    >
      Comprar ahora
    </button>
  );
}
