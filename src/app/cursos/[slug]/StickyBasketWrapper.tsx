"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import StickyBasket from "./StickyBasket";

interface StickyBasketWrapperProps {
  courseId: string;
  coursePrice: number;
  visibleThreshold?: number;
}

export default function StickyBasketWrapper({
  courseId,
  coursePrice,
  visibleThreshold = 400,
}: StickyBasketWrapperProps) {
  const [hasPurchased, setHasPurchased] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkPurchase() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        const userId = sessionData.session.user.id;
        const { data, error } = await supabase
          .from("purchases")
          .select("id")
          .eq("course_id", courseId)
          .eq("user_id", userId)
          .single();
        if (!error && data) {
          setHasPurchased(true);
        } else {
          setHasPurchased(false);
        }
      } else {
        setHasPurchased(false);
      }
      setIsLoading(false);
    }
    checkPurchase();
  }, [courseId]);

  const handleBuy = () => {
    const amountInCents = coursePrice * 100;
    window.location.href = `/checkout?courseId=${courseId}&amount=${amountInCents}`;
  };

  if (isLoading) return null;
  if (hasPurchased) return null;

  return (
    <StickyBasket
      onBuy={handleBuy}
      hasPurchased={hasPurchased}
      visibleThreshold={visibleThreshold}
      courseId={courseId}
      coursePrice={coursePrice}
    />
  );
}
