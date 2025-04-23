/* --------------------------------------------------------------------
   src/app/components/BuyButton.tsx
   -------------------------------------------------------------------- */
   "use client";

   import { useRouter } from "next/navigation";
   import { supabase } from "@/lib/supabaseClient";
   import styles from "./BuyButton.module.css";
   
   interface BuyButtonProps {
     course: { id: string };
   }
   
   export default function BuyButton({ course }: BuyButtonProps) {
     const router = useRouter();
   
     async function handleBuy() {
       /* If the user isn’t logged in, send them to login first */
       const { data: sess } = await supabase.auth.getSession();
       if (!sess.session) {
         router.push("/auth/login");
         return;
       }
   
       /* Otherwise go straight to your checkout page */
       router.push(`/checkout?courseId=${course.id}`);
     }
   
     return (
       <button
         data-buy-button          /* ← key for OfferBar to locate it */
         onClick={handleBuy}
         className={styles.buyButton}
       >
         Comprar ahora
       </button>
     );
   }
   