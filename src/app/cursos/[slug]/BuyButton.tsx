// src/app/components/BuyButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import styles from "./BuyButton.module.css";

interface BuyButtonProps {
  course: { id: string };
}

export default function BuyButton({ course }: BuyButtonProps) {
  const router = useRouter();

  const handleBuy = async () => {
    const { data: sess } = await supabase.auth.getSession();
    if (!sess.session) return router.push("/auth/login");
    // Navegar a tu propia página de checkout
    router.push(`/checkout?courseId=${course.id}`);
  };

  return (
    <button className={styles.buyButton} onClick={handleBuy}>
      Comprar Curso
    </button>
  );
}
