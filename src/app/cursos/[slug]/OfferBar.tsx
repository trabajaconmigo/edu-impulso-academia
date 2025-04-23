/* --------------------------------------------------
   OfferBar – hides itself if the user already bought
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
   const fmt = (iso: string | null) => {
     if (!iso) return "";
     const diff = new Date(iso).getTime() - Date.now();
     if (diff <= 0) return "";
     const h = Math.floor(diff / 3_600_000);
     const m = Math.floor((diff % 3_600_000) / 60_000);
     const s = Math.floor((diff % 60_000) / 1_000);
     return `${h.toString().padStart(2, "0")}:${m
       .toString()
       .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
   };
   
   export default function OfferBar({
     courseId,
     discountActive,
     expiresAt,
   }: OfferBarProps) {
     /* -------------- 1. check ownership ------------------ */
     const [hasPurchased, setHasPurchased] = useState<boolean | null>(null);
   
     useEffect(() => {
       let cancelled = false;
       (async () => {
         const { data: sess } = await supabase.auth.getSession();
         if (!sess.session) return setHasPurchased(false);
         const userId = sess.session.user.id;
         const { data, error } = await supabase
           .from("purchases")
           .select("id")
           .eq("course_id", courseId)
           .eq("user_id", userId)
           .single();
         if (!cancelled) setHasPurchased(!error && !!data);
       })();
       return () => {
         cancelled = true;
       };
     }, [courseId]);
   
     /* -------------- 2. countdown ------------------------ */
     const [remaining, setRemaining] = useState(fmt(expiresAt));
     useEffect(() => {
       if (!expiresAt) return;
       const tid = setInterval(() => setRemaining(fmt(expiresAt)), 1_000);
       return () => clearInterval(tid);
     }, [expiresAt]);
   
     /* -------------- 3. breakpoint ----------------------- */
     const [isMobile, setIsMobile] = useState(false);
     useEffect(() => {
       const mq = matchMedia("(max-width: 767px)");
       const upd = () => setIsMobile(mq.matches);
       upd();
       mq.addEventListener("change", upd);
       return () => mq.removeEventListener("change", upd);
     }, []);
   
     /* -------------- 4. buy handler ---------------------- */
     const router = useRouter();
     const goCheckout = useCallback(async () => {
       const { data: sess } = await supabase.auth.getSession();
       if (!sess.session) return router.push("/auth/login");
       router.push(`/checkout?courseId=${courseId}`);
     }, [courseId, router]);
   
     /* -------------- 5. visibility flags ----------------- */
     const showBar = discountActive && !hasPurchased;
     const showFab = !discountActive && !hasPurchased && isMobile;
   
     const copy = isMobile ? "¡Oferta termina pronto!" : "¡Aprovecha la oferta antes de que termine!";
   
     return (
       <>
         {showBar && (
           <div className={styles.bar} onClick={goCheckout}>
             <span className={styles.clock}>{remaining || "--:--:--"}</span>
             <span className={styles.text}>{copy}</span>
             <FiShoppingCart className={styles.cartIcon} />
           </div>
         )}
   
         {showFab && (
           <button
             aria-label="Comprar curso"
             className={styles.fab}
             onClick={goCheckout}
           >
             <FiShoppingCart size={24} />
           </button>
         )}
       </>
     );
   }
   