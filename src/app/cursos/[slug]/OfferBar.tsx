/* --------------------------------------------------
   OfferBar – CLIENT COMPONENT  (mobile-optimized text)
   -------------------------------------------------- */
   "use client";

   import { useCallback, useEffect, useState } from "react";
   import { useRouter } from "next/navigation";
   import { FiShoppingCart } from "react-icons/fi";
   import { supabase } from "@/lib/supabaseClient";
   import styles from "./OfferBar.module.css";
   
   interface OfferBarProps {
     courseId: string;
     discountActive: boolean;
     expiresAt: string | null;
   }
   
   /* HH:MM:SS formatter */
   const formatRemaining = (iso: string | null): string => {
     if (!iso) return "";
     const ms = new Date(iso).getTime() - Date.now();
     if (ms <= 0) return "";
     const h = Math.floor(ms / 3_600_000);
     const m = Math.floor((ms % 3_600_000) / 60_000);
     const s = Math.floor((ms % 60_000) / 1_000);
     return `${h.toString().padStart(2, "0")}:${m
       .toString()
       .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
   };
   
   export default function OfferBar({
     courseId,
     discountActive,
     expiresAt,
   }: OfferBarProps) {
     const [remaining, setRemaining] = useState(formatRemaining(expiresAt));
   
     /* tick every second */
     useEffect(() => {
       if (!expiresAt) return;
       const id = setInterval(
         () => setRemaining(formatRemaining(expiresAt)),
         1_000
       );
       return () => clearInterval(id);
     }, [expiresAt]);
   
     /* break-point */
     const [isMobile, setIsMobile] = useState(false);
     useEffect(() => {
       const mq = matchMedia("(max-width: 767px)");
       const update = () => setIsMobile(mq.matches);
       update();
       mq.addEventListener("change", update);
       return () => mq.removeEventListener("change", update);
     }, []);
   
     /* buy handler */
     const router = useRouter();
     const handleBuy = useCallback(async () => {
       const { data: sess } = await supabase.auth.getSession();
       if (!sess.session) return router.push("/auth/login");
       router.push(`/checkout?courseId=${courseId}`);
     }, [courseId, router]);
   
     /* visibility */
     const showBar = discountActive;
     const showFab = !discountActive && isMobile;
   
     /* copy */
     const text = isMobile
       ? "¡Oferta termina pronto!"
       : "¡Aprovecha la oferta antes de que termine!";
   
     return (
       <>
         {showBar && (
           <div className={styles.bar} onClick={handleBuy}>
             <span className={styles.clock}>{remaining || "--:--:--"}</span>
             <span className={styles.text}>{text}</span>
             <FiShoppingCart className={styles.cartIcon} />
           </div>
         )}
   
         {showFab && (
           <button
             aria-label="Comprar curso"
             className={styles.fab}
             onClick={handleBuy}
           >
             <FiShoppingCart size={24} />
           </button>
         )}
       </>
     );
   }
   