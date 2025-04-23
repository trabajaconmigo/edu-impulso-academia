/* ------------------------------------------------------------------
   Fixed urgency bar (desktop)  +  floating basket (mobile)
   CLIENT COMPONENT
   ------------------------------------------------------------------ */
   "use client";

   import { useEffect, useState } from "react";
   import { useRouter }           from "next/navigation";
   import { FiShoppingCart }      from "react-icons/fi";
   import styles                  from "./OfferBar.module.css";
   
   interface Props {
     discountActive: boolean;
     /** ISO date-string – when the countdown should hit 0 */
     expiresAt: string | null;
   }
   
   /* helper ----------------------------------------------------------- */
   function remainingMs(expiresAt: string | null) {
     if (!expiresAt) return 0;
     return Math.max(0, new Date(expiresAt).getTime() - Date.now());
   }
   const pad = (n: number) => n.toString().padStart(2, "0");
   
   /* component -------------------------------------------------------- */
   export default function OfferBar({ discountActive, expiresAt }: Props) {
     const router = useRouter();
     const [msLeft, setMsLeft] = useState<number>(() => remainingMs(expiresAt));
   
     /* tick every second */
     useEffect(() => {
       if (!expiresAt) return;
       const id = setInterval(() => setMsLeft(remainingMs(expiresAt)), 1_000);
       return () => clearInterval(id);
     }, [expiresAt]);
   
     /* time parts */
     const d  = Math.floor(msLeft / 86_400_000);
     const h  = Math.floor((msLeft / 3_600_000) % 24);
     const m  = Math.floor((msLeft /   60_000) % 60);
     const s  = Math.floor((msLeft /    1_000) % 60);
   
     /* rules ---------------------------------------------------------- */
     const countdownRunning = discountActive && msLeft > 0;
     const hideDesktopBar   = !countdownRunning;
   
     /* scroll / redirect to the existing buy button */
     const handleBuyClick = () => {
       /* customise if you have a specific anchor */
       const el = document.querySelector("#buyButton");
       if (el) (el as HTMLElement).scrollIntoView({ behavior: "smooth" });
       else router.push("#comprar");
     };
   
     /* --------------------------------------------------------------- */
     return (
       <div className={styles.container}>
         {/* desktop bar (only when discount is active) */}
         {!hideDesktopBar && (
           <div className={styles.barDesktop}>
             <span className={styles.msg}>Oferta termina en</span>
             <span className={styles.time}>
               {d > 0 && `${d}d `}{pad(h)}:{pad(m)}:{pad(s)}
             </span>
           </div>
         )}
   
         {/* mobile floating basket – always visible */}
         <button
           className={
             countdownRunning ? styles.basketWithBar : styles.basketCircle
           }
           onClick={handleBuyClick}
           aria-label="Comprar curso"
         >
           <FiShoppingCart size={26} />
         </button>
       </div>
     );
   }
   