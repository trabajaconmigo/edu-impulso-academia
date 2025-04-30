"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import styles from "./Felicidades.module.css";

export default function FelicidadesPage() {
  const router = useRouter();
  const [salesCount, setSalesCount] = useState<number | null>(null);

  useEffect(() => {
    // 1) Fire Meta-Pixel again (so Facebook logs the purchase on this page)
    if (typeof (window as any).fbq === "function") {
      (window as any).fbq("track", "Purchase");
    }

    // 2) Grab total number of orders
    (async () => {
      const { count, error } = await supabase
        .from("orders")
        .select("id", { head: true, count: "exact" });
      if (!error && typeof count === "number") {
        setSalesCount(count);
      } else {
        console.error("Error fetching sales count:", error);
      }
    })();
  }, []);

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>¡Felicidades!</h1>
      <p className={styles.message}>
        Gracias por tu compra. 😊
      </p>

      {salesCount !== null ? (
        <p className={styles.counter}>
          Ya somos <strong>{salesCount.toLocaleString()}</strong> emprendedores
          que confían en Escuela360.
        </p>
      ) : (
        <p className={styles.counter}>Cargando número de compras…</p>
      )}

      <button
        className={styles.profileBtn}
        onClick={() => router.push("/perfil")}
      >
        Ir a mi perfil
      </button>
    </div>
  );
}
