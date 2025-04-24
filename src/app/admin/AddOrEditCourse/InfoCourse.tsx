/* --------------------------------------------------------------------
   src/app/admin/AddOrEditCourse/InfoCourse.tsx
   ------------------------------------------------------------------ */
   "use client";

   import React, { ChangeEvent } from "react";
   import { InstructorRow, CourseData } from "./types";    // 👈 NEW
   import InstructorPopup from "./InstructorPopup";
   import styles from "./styles/AddOrEditCourse.module.css";
   
   interface InfoCourseProps {
     course: CourseData;
     instructors: InstructorRow[];
     onChange: (name: string, value: any) => void;
     onShowInstructorPopup: (inst: InstructorRow | null) => void;
   }
   
   export default function InfoCourse({
     course,
     instructors,
     onChange,
     onShowInstructorPopup,
   }: InfoCourseProps) {
     return (
       <div className={styles.card}>
         <h2 className={styles.cardTitle}>Información del Curso</h2>
   
         {/* … all of your existing fields here unchanged … */}
   
         {/* Here's the referral toggles you added */}
         <div className={styles.fieldGroup}>
           <label>Programa de Referidos Habilitado</label>
           <input
             type="checkbox"
             name="referral_enabled"
             checked={!!course.referral_enabled}
             onChange={(e) => onChange("referral_enabled", e.target.checked)}
           />
         </div>
         <div className={styles.fieldGroup}>
           <label>Referido a mitad de precio</label>
           <input
             type="checkbox"
             name="referral_half_price"
             checked={!!course.referral_half_price}
             onChange={(e) => onChange("referral_half_price", e.target.checked)}
           />
         </div>
       </div>
     );
   }
   