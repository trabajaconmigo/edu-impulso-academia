/* ------------------------------------------------------------------
   src/app/checkout/page.tsx
   CLIENT component (Supabase & Stripe)
   ------------------------------------------------------------------ */
   "use client";

   import React, { Suspense, useEffect, useState } from "react";
   import { useSearchParams } from "next/navigation";
   import { loadStripe } from "@stripe/stripe-js";
   import { Elements } from "@stripe/react-stripe-js";
   import { supabase } from "@/lib/supabaseClient";
   
   /* existing children */
   import CheckoutForm from "./CheckoutForm";
   import OxxoPaymentForm from "./OxxoPaymentForm";
   import UserLoginRegistrationForm from "./UserLoginRegistrationForm";
   
   /* new referral popup */
   import ReferralPopup from "./ReferralPopup";
   
   /* styles */
   import styles from "./page.module.css";
   
   const stripePromise = loadStripe(
     process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
   );
   
   function CheckoutPageContent() {
     const sp = useSearchParams();
     const courseId = sp.get("courseId");
   
     /* ---------------- state ---------------- */
     const [course, setCourse] = useState<any | null>(null);
     const [amountCents, setAmount] = useState(0);
     const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
     const [loading, setLoading] = useState(true);
   
     /* referral */
     const [refNeeded, setRefNeeded] = useState(false);
     const [refDone, setRefDone] = useState(false);
   
     /* -------------------------------------------------------------- */
     /* fetch course + session                                        */
     useEffect(() => {
       if (!courseId) return;
   
       (async () => {
         const { data: sess } = await supabase.auth.getSession();
         setLoggedIn(!!sess.session);
   
         const { data, error } = await supabase
           .from("courses")
           .select(`
             id, slug, title, price,
             discount_percentage, discount_active,
             referral_enabled, referral_half_price
           `)
           .eq("id", courseId)
           .single();
         if (!error && data) {
           setCourse(data);
           setRefNeeded(data.referral_enabled);
   
           /* compute starting price */
           const baseDiscount =
             data.discount_active && data.discount_percentage > 0
               ? data.price * (1 - data.discount_percentage / 100)
               : data.price;
           setAmount(Math.round(baseDiscount * 100));
         }
   
         setLoading(false);
       })();
     }, [courseId]);
   
     /* -------------------------------------------------------------- */
     /* recompute price when referralDone                             */
     useEffect(() => {
       if (!course || !refDone) return;
   
       if (course.referral_half_price) {
         const half = course.price / 2;
         setAmount(Math.round(half * 100));
       } else {
         /* free */
         setAmount(0);
       }
     }, [course, refDone]);
   
     /* -------------------------------------------------------------- */
     /* FREE path: grant course immediately when referral gives full   */
     useEffect(() => {
       if (!refDone || !course || course.referral_half_price) return;
   
       (async () => {
         const { data: sess } = await supabase.auth.getSession();
         if (!sess.session) return;
         await fetch("/api/save-purchase", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({
             userId: sess.session.user.id,
             courseId: course.id,
             paymentId: "referral-wa",
             amount: 0,
             viaReferral: true,
           }),
         });
         window.location.href = "/perfil";
       })();
     }, [refDone, course]);
   
     /* -------------------------------------------------------------- */
     /* callback from popup                                            */
     function onReferralResult(shared: boolean) {
       setRefNeeded(false);
       setRefDone(shared);
     }
   
     /* -------------------------------------------------------------- */
     /* decide show popup                                              */
     const showPopup = refNeeded && !refDone;
   
     /* -------------------------------------------------------------- */
     /* guards                                                         */
     if (!courseId) {
       return <div className={styles.container}>ID de curso faltante.</div>;
     }
     if (loading || loggedIn === null || !course) {
       return <div className={styles.container}>Cargando datos…</div>;
     }
   
     /* -------------------------------------------------------------- */
     /* not logged in – show login/register                            */
     if (!loggedIn) {
       return (
         <div className={styles.container}>
           <UserLoginRegistrationForm
             onLoginSuccess={() => setLoggedIn(true)}
             courseId={courseId}
             amount={amountCents / 100}
           />
         </div>
       );
     }
   
     /* -------------------------------------------------------------- */
     /* main checkout UI                                               */
     const displayAmount = amountCents / 100;
   
     return (
       <>
         {/* referral popup */}
         {showPopup && course && (
           <ReferralPopup
             slug={course.slug}
             halfPrice={course.referral_half_price}
             onDone={onReferralResult}
           />
         )}
   
         <div className={styles.checkoutBox}>
           <h1 className={styles.checkoutTitle}>Finalizar Compra</h1>
           <p className={styles.checkoutSubtitle}>
             Estás comprando: <strong>{course.title}</strong>
           </p>
           <p className={styles.checkoutPrice}>
             Total a pagar:&nbsp;
             <strong>
               {displayAmount === 0
                 ? "GRATIS"
                 : `MX$${displayAmount.toFixed(2)}`}
             </strong>
           </p>
   
           {displayAmount === 0 ? (
             <p className={styles.freeNote}>
               El curso se añadirá automáticamente a tu cuenta. ¡Gracias por
               compartir!
             </p>
           ) : (
             <Elements stripe={stripePromise}>
               <div className={styles.paymentMethods}>
                 <CheckoutForm
                   courseId={course.id}
                   amountCents={amountCents}
                 />
                 <OxxoPaymentForm
                   courseId={course.id}
                   amountCents={amountCents}
                 />
               </div>
             </Elements>
           )}
         </div>
       </>
     );
   }
   
   export default function CheckoutPage() {
     return (
       <Suspense
         fallback={<div className={styles.loading}>Cargando checkout…</div>}
       >
         <CheckoutPageContent />
       </Suspense>
     );
   }
   