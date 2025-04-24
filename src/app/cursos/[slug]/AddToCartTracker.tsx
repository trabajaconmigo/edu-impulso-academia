// src/app/course/[slug]/AddToCartTracker.tsx
"use client";

import React from "react";

interface AddToCartTrackerProps {
  courseId: string | number;
  price: number;
  onClick?: () => void;
}

export default function AddToCartTracker({
  courseId,
  price,
  onClick,
}: AddToCartTrackerProps) {
  const handleClick = () => {
    // 1) Facebook AddToCart
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "AddToCart", {
        content_ids: [courseId],
        content_type: "product",
        value: price,
        currency: "MXN",
      });
    }

    // 2) TikTok AddToCart
    if (typeof window !== "undefined" && (window as any).ttq) {
      (window as any).ttq.track("AddToCart", {
        content_id: String(courseId),
        content_type: "product",
        price,
        currency: "MXN",
      });
    }

    // 3) Google Analytics 4
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "add_to_cart", {
        items: [{ id: courseId, currency: "MXN", price }],
      });
    }

    // finally call any “real” onClick handler
    onClick?.();
  };

  return (
    <button onClick={handleClick}>
      Comprar
    </button>
  );
}
