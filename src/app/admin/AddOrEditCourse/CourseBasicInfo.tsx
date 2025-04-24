/* --------------------------------------------------------------------
   src/app/admin/CourseBasicInfo.tsx
   ------------------------------------------------------------------ */
   "use client";

   import React, { ChangeEvent } from "react";
   import { COURSE_CATEGORIES } from "@/app/components/courseCategories";
   import styles from "./styles/AddOrEditCourse.module.css";
   
   interface Props {
     course: any;
     instructors: any[];
     onChange: (name: string, value: any) => void;
     onShowInstructorPopup: (inst: any | null) => void;
   }
   
   export default function CourseBasicInfo({
     course,
     instructors,
     onChange,
     onShowInstructorPopup,
   }: Props) {
     return (
       <div className={styles.card}>
         <h2 className={styles.cardTitle}>Información del Curso</h2>
   
         {/* Título y Slug */}
         {[
           { label: "Título del Curso", name: "title" },
           { label: "Slug", name: "slug" },
         ].map(({ label, name }) => (
           <div className={styles.fieldGroup} key={name}>
             <label>{label}</label>
             <input
               type="text"
               name={name}
               value={course[name] || ""}
               onChange={(e: ChangeEvent<HTMLInputElement>) =>
                 onChange(name, e.target.value)
               }
               required
             />
           </div>
         ))}
   
         {/* Descripción breve y subtítulo */}
         <div className={styles.fieldGroup}>
           <label>Descripción Breve</label>
           <textarea
             rows={3}
             name="description"
             value={course.description || ""}
             onChange={(e) => onChange("description", e.target.value)}
             required
           />
         </div>
         <div className={styles.fieldGroup}>
           <label>Subtítulo</label>
           <input
             type="text"
             name="subtitle"
             value={course.subtitle || ""}
             onChange={(e) => onChange("subtitle", e.target.value)}
           />
         </div>
   
         {/* Instructor */}
         <div className={styles.fieldGroup}>
           <label>Instructor</label>
           <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
             <select
               name="instructor_id"
               value={course.instructor_id || ""}
               onChange={(e) => onChange("instructor_id", e.target.value)}
             >
               <option value="">-- Seleccionar --</option>
               {instructors.map((i) => (
                 <option key={i.id} value={i.id}>
                   {i.full_name}
                 </option>
               ))}
             </select>
             <button
               type="button"
               className={styles.addLessonBtn}
               onClick={() =>
                 onShowInstructorPopup(
                   course.instructor_id
                     ? instructors.find((i) => i.id === course.instructor_id)
                     : null
                 )
               }
             >
               {course.instructor_id ? "Editar Instructor" : "Crear Instructor"}
             </button>
           </div>
         </div>
   
         {/* Thumbnail URL */}
         <div className={styles.fieldGroup}>
           <label>Thumbnail URL</label>
           <input
             type="text"
             name="thumbnail_url"
             value={course.thumbnail_url || ""}
             onChange={(e) => onChange("thumbnail_url", e.target.value)}
             required
           />
         </div>
   
         {/* Precio, Idioma */}
         <div className={styles.fieldRow}>
           <div className={styles.fieldCol}>
             <label>Precio (MXN)</label>
             <input
               type="number"
               name="price"
               value={course.price}
               onChange={(e) =>
                 onChange("price", parseFloat(e.target.value) || 0)
               }
               required
             />
           </div>
           <div className={styles.fieldCol}>
             <label>Idioma</label>
             <input
               type="text"
               name="language"
               value={course.language || ""}
               onChange={(e) => onChange("language", e.target.value)}
             />
           </div>
         </div>
   
         {/* Categoría */}
         <div className={styles.fieldGroup}>
           <label>Categoría</label>
           <select
             name="category"
             value={course.category}
             onChange={(e) => onChange("category", e.target.value)}
           >
             {COURSE_CATEGORIES.map((c) => (
               <option key={c.value} value={c.value}>
                 {c.label}
               </option>
             ))}
           </select>
         </div>
   
         {/* --- NEW: Programa de Referidos --- */}
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
   