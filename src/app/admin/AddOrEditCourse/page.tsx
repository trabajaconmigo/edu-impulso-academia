/* --------------------------------------------------------------------
   src/app/admin/AddOrEditCoursePage.tsx
   ------------------------------------------------------------------ */
   "use client";

   import React, { useEffect, useState } from "react";
   import { supabase } from "@/lib/supabaseClient";
   import { useRouter } from "next/navigation";
   import InstructorPopup from "./InstructorPopup";
   import CourseBasicInfo from "./CourseBasicInfo";
   import styles from "./styles/AddOrEditCourse.module.css";
   
   /* ---------- Constants ------------------------------------------------- */
   
   const PREDEFINED_FEATURE_ICONS = [
     {
       label: "Ícono de Video",
       url: "https://rvinrzxeetertylulqkx.supabase.co/storage/v1/object/public/courseimg/video_icon.png",
     },
     {
       label: "Ícono de Descargas",
       url: "https://rvinrzxeetertylulqkx.supabase.co/storage/v1/object/public/courseimg/download.png",
     },
     {
       label: "Ícono de Tareas",
       url: "https://rvinrzxeetertylulqkx.supabase.co/storage/v1/object/public/courseimg/certificate-icon.png",
     },
     {
       label: "Ícono de Dispositivos",
       url: "https://rvinrzxeetertylulqkx.supabase.co/storage/v1/object/public/courseimg/devices-icon.png",
     },
     {
       label: "Ícono de Foros",
       url: "https://rvinrzxeetertylulqkx.supabase.co/storage/v1/object/public/courseimg/foros.png",
     },
     {
       label: "Ícono de Certificado",
       url: "https://rvinrzxeetertylulqkx.supabase.co/storage/v1/object/public/courseimg/certificate.png",
     },
   ];
   
   /* ---------- Types ----------------------------------------------------- */
   
   interface FeatureItem {
     iconUrl: string;
     text: string;
   }
   
   interface LessonInput {
     id?: number;
     title: string;
     youtube_link: string;
     paid: boolean;
     order_index: number;
     minutes: number;
     seconds: number;
   }
   
   interface SectionInput {
     id?: number;
     title: string;
     order_index: number;
     lessons: LessonInput[];
   }
   
   interface CourseData {
     /* core */
     id?: string;
     slug: string;
     title: string;
     description: string;
     subtitle?: string;
     thumbnail_url: string;
     price: number;
     language?: string;
     category?: string;
     author_id?: string | null;
   
     /* discount */
     discount_percentage: number;
     discount_active: boolean;
     expires_at?: string | null;
   
     /* HTML fields */
     course_includes?: string;
     what_you_ll_learn?: string;
     requirements?: string | null;
     description_long?: string | null;
   
     instructor_id?: string | null;
   }
   
   interface InstructorRow {
     id: string;
     user_id: string;
     full_name: string;
   }
   
   /* ===================================================================== */
   
   export default function AddOrEditCoursePage() {
     const router = useRouter();
   
     /* --------- State --------------------------------------------------- */
   
     const [isEditMode, setIsEditMode] = useState(false);
     const [loading, setLoading] = useState(false);
   
     const [course, setCourse] = useState<CourseData>({
       slug: "",
       title: "",
       description: "",
       thumbnail_url: "",
       price: 0,
       category: "otros",
       language: "",
   
       discount_percentage: 0,
       discount_active: false,
       expires_at: null,
     });
   
     const [selectedFile, setSelectedFile] = useState<File | null>(null);
     const [features, setFeatures] = useState<FeatureItem[]>([]);
     const [sections, setSections] = useState<SectionInput[]>([]);
     const [learningPoints, setLearningPoints] = useState<string[]>([]);
     const [requirementsPoints, setRequirementsPoints] = useState<string[]>([]);
     const [descParas, setDescParas] = useState<string[]>([]);
     const [instructors, setInstructors] = useState<InstructorRow[]>([]);
     const [showInstructorPopup, setShowInstructorPopup] = useState(false);
     const [editingInstructor, setEditingInstructor] = useState<InstructorRow | null>(null);
   
     /* --------- Initial load ------------------------------------------- */
   
     useEffect(() => {
       const cid = new URLSearchParams(window.location.search).get("courseId");
       if (cid) {
         setIsEditMode(true);
         fetchExistingCourse(cid);
       } else {
         fetchAuthorId();
       }
       fetchAllInstructors();
     }, []);
   
     /* --------- Supabase fetch helpers --------------------------------- */
   
     async function fetchAuthorId() {
       const { data } = await supabase.auth.getUser();
       if (data?.user) setCourse((p) => ({ ...p, author_id: data.user.id }));
     }
   
     async function fetchAllInstructors() {
       const { data } = await supabase.from("instructors").select("*");
       if (data) setInstructors(data);
     }
   
     async function fetchExistingCourse(id: string) {
       setLoading(true);
       try {
         const { data } = await supabase.from("courses").select("*").eq("id", id).single();
         if (!data) return;
         setCourse({
           ...(data as CourseData),
           expires_at: data.expires_at ? new Date(data.expires_at).toISOString().slice(0, 16) : null,
         });
   
         if (data.what_you_ll_learn)
           setLearningPoints(data.what_you_ll_learn.split(/\r?\n+/).filter((s: string) => s.trim()));
         if (data.requirements) setRequirementsPoints(parseLiHTML(data.requirements));
         if (data.description_long) setDescParas(parseParasHTML(data.description_long));
         if (data.course_includes) setFeatures(parseFeaturesHTML(data.course_includes));
   
         const { data: contents } = await supabase
           .from("course_contents")
           .select("*")
           .eq("course_id", id)
           .order("order_index");
         if (contents) buildSections(contents);
       } finally {
         setLoading(false);
       }
     }
   
     /* --------- Change helpers ----------------------------------------- */
   
     function handleCourseChange(
       e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
     ) {
       const { name, type } = e.target;
       let value: any = (e.target as any).value;
       if (type === "checkbox") value = (e.target as HTMLInputElement).checked;
       else if (type === "number") value = parseFloat(value) || 0;
       setCourse((prev) => ({ ...prev, [name]: value }));
     }
   
     // Cambio proveniente de CourseBasicInfo
     const handleBasicInfoChange = (name: string, value: any) =>
       setCourse((prev) => ({ ...prev, [name]: value }));
   
     const handleShowInstructorPopup = (inst: InstructorRow | null) => {
       setEditingInstructor(inst);
       setShowInstructorPopup(true);
     };
   
     /* --------- HTML helpers ------------------------------------------- */
   
     function parseFeaturesHTML(html: string): FeatureItem[] {
       const out: FeatureItem[] = [];
       html
         .split("<li>")
         .slice(1)
         .forEach((chunk) => {
           const inner = chunk.split("</li>")[0];
           const url = (inner.match(/<img[^>]+src="([^"]+)"/) || [])[1] || "";
           const text = inner.replace(/<img[^>]+>/, "").trim();
           out.push({ iconUrl: url, text });
         });
       return out;
     }
   
     const parseLiHTML = (html: string) =>
       html.split("<li>").slice(1).map((c) => c.split("</li>")[0].replace(/<[^>]+>/g, ""));
   
     const parseParasHTML = (html: string) =>
       html.split("<p>").slice(1).map((c) => c.split("</p>")[0].replace(/<[^>]+>/g, ""));
   
     function buildFeaturesHTML(list: FeatureItem[]) {
       if (!list.length) return "";
       return (
         "<ul>\n" +
         list.map((f) => `  <li><img src="${f.iconUrl}" /> ${f.text}</li>`).join("\n") +
         "\n</ul>"
       );
     }
     const buildRequirementsHTML = (arr: string[]) =>
       !arr.length
         ? ""
         : '<ul style="list-style-type: disc;">\n' +
           arr.map((p) => `  <li>${p}</li>`).join("\n") +
           "\n</ul>";
     const buildDescriptionHTML = (paras: string[]) =>
       paras.map((p, i) =>
         i ? `<p style="margin-top:1rem;">${p}</p>` : `<p>${p}</p>`
       ).join("\n");
   
     /* --------- Sections helpers --------------------------------------- */
     // (sin cambios) ------------------------------------------------------
     function buildSections(rows: any[]) {
       const secs = rows.filter((r) => r.type === "section");
       const lecs = rows.filter((r) => r.type === "lecture");
       setSections(
         secs.map((s) => ({
           id: s.id,
           title: s.title,
           order_index: s.order_index,
           lessons: lecs
             .filter((l) => l.parent_section_id === s.id)
             .map((l) => ({
               id: l.id,
               title: l.title,
               youtube_link: l.youtube_link,
               paid: l.paid,
               order_index: l.order_index,
               minutes: Math.floor((l.duration || 0) / 60),
               seconds: (l.duration || 0) % 60,
             })),
         }))
       );
     }
   
     async function saveSectionsAndLessons(course_id: string) {
       // (código idéntico al original)
       for (const sec of sections) {
         let sectionId = sec.id;
         if (!sectionId) {
           const { data: newSec } = await supabase
             .from("course_contents")
             .insert({
               course_id,
               type: "section",
               title: sec.title,
               order_index: sec.order_index,
               paid: false,
             })
             .select()
             .single();
           sectionId = newSec!.id;
         } else {
           await supabase
             .from("course_contents")
             .update({
               title: sec.title,
               order_index: sec.order_index,
             })
             .eq("id", sectionId);
         }
         for (const les of sec.lessons) {
           const duration = les.minutes * 60 + les.seconds;
           if (!les.id) {
             await supabase.from("course_contents").insert({
               course_id,
               type: "lecture",
               title: les.title,
               youtube_link: les.youtube_link,
               order_index: les.order_index,
               parent_section_id: sectionId,
               duration,
               paid: les.paid,
             });
           } else {
             await supabase
               .from("course_contents")
               .update({
                 title: les.title,
                 youtube_link: les.youtube_link,
                 order_index: les.order_index,
                 duration,
                 paid: les.paid,
               })
               .eq("id", les.id);
           }
         }
       }
     }
   
     /* --------- Image upload ------------------------------------------- */
   
     const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) =>
       setSelectedFile(e.target.files?.[0] ?? null);
   
     async function resizeImage(file: File, w: number, h: number): Promise<Blob> {
       return new Promise((res, rej) => {
         const fr = new FileReader();
         fr.onload = () => {
           const img = new Image();
           img.onload = () => {
             const canvas = document.createElement("canvas");
             canvas.width = w;
             canvas.height = h;
             canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
             canvas.toBlob((b) => (b ? res(b) : rej("blob err")), "image/jpeg", 0.8);
           };
           img.src = fr.result as string;
         };
         fr.onerror = (e) => rej(e);
         fr.readAsDataURL(file);
       });
     }
   
     async function handleUploadImage() {
       if (!selectedFile) return;
       setLoading(true);
       try {
         const blob = await resizeImage(selectedFile, 750, 500);
         const name = `${Date.now()}.${selectedFile.name.split(".").pop()}`;
         await supabase.storage.from("courseimg").upload(name, blob);
         const url = `https://rvinrzxeetertylulqkx.supabase.co/storage/v1/object/public/courseimg/${name}`;
         setCourse((p) => ({ ...p, thumbnail_url: url }));
         alert("Imagen subida");
       } finally {
         setLoading(false);
       }
     }
   
     /* --------- Learning / Req / Desc helpers --------------------------- */
     // (idénticos a los originales)
     const addLearningPoint = () => setLearningPoints((p) => [...p, ""]);
     const removeLearningPoint = (i: number) =>
       setLearningPoints((p) => p.filter((_, idx) => idx !== i));
     const handleLearningChange = (i: number, v: string) =>
       setLearningPoints((p) => p.map((e, idx) => (idx === i ? v : e)));
   
     const addReqPoint = () => setRequirementsPoints((p) => [...p, ""]);
     const removeReqPoint = (i: number) =>
       setRequirementsPoints((p) => p.filter((_, idx) => idx !== i));
     const handleReqChange = (i: number, v: string) =>
       setRequirementsPoints((p) => p.map((e, idx) => (idx === i ? v : e)));
   
     const addDescPara = () => setDescParas((p) => [...p, ""]);
     const removeDescPara = (i: number) =>
       setDescParas((p) => p.filter((_, idx) => idx !== i));
     const handleDescChange = (i: number, v: string) =>
       setDescParas((p) => p.map((e, idx) => (idx === i ? v : e)));
   
     /* --------- Features helpers --------------------------------------- */
     const addFeature = () => setFeatures((f) => [...f, { iconUrl: "", text: "" }]);
     const removeFeature = (i: number) => setFeatures((f) => f.filter((_, idx) => idx !== i));
     const handleFeatureChange = (i: number, name: "iconUrl" | "text", value: string) =>
       setFeatures((f) => f.map((e, idx) => (idx === i ? { ...e, [name]: value } : e)));
   
     /* --------- Sections & Lessons helpers ------------------------------ */
     // (idénticos a los originales)
     const addSection = () =>
       setSections((s) => [...s, { title: "", order_index: s.length + 1, lessons: [] }]);
     const removeSection = (i: number) => setSections((s) => s.filter((_, idx) => idx !== i));
     const handleSectionChange = (i: number, k: string, v: any) =>
       setSections((s) => s.map((e, idx) => (idx === i ? { ...e, [k]: v } : e)));
   
     const addLesson = (secIdx: number) =>
       setSections((s) =>
         s.map((sec, idx) =>
           idx === secIdx
             ? {
                 ...sec,
                 lessons: [
                   ...sec.lessons,
                   {
                     title: "",
                     youtube_link: "",
                     paid: false,
                     order_index: sec.lessons.length + 1,
                     minutes: 0,
                     seconds: 0,
                   },
                 ],
               }
             : sec
         )
       );
   
     const removeLesson = (secIdx: number, lesIdx: number) =>
       setSections((s) =>
         s.map((sec, idx) =>
           idx === secIdx ? { ...sec, lessons: sec.lessons.filter((_, li) => li !== lesIdx) } : sec
         )
       );
   
     const handleLessonChange = (
       secIdx: number,
       lesIdx: number,
       field: keyof LessonInput,
       value: any
     ) =>
       setSections((s) =>
         s.map((sec, idx) =>
           idx === secIdx
             ? {
                 ...sec,
                 lessons: sec.lessons.map((l, li) =>
                   li === lesIdx ? { ...l, [field]: value } : l
                 ),
               }
             : sec
         )
       );
   
     /* --------- Submit -------------------------------------------------- */
   
     async function handleSubmit(e: React.FormEvent) {
       e.preventDefault();
       setLoading(true);
       try {
         const payload = {
           ...course,
           expires_at: course.expires_at ? new Date(course.expires_at).toISOString() : null,
           course_includes: buildFeaturesHTML(features),
           what_you_ll_learn: learningPoints.join("\n\n"),
           requirements: buildRequirementsHTML(requirementsPoints),
           description_long: buildDescriptionHTML(descParas),
         };
   
         if (isEditMode && course.id) {
           await supabase.from("courses").update(payload).eq("id", course.id);
           await saveSectionsAndLessons(course.id);
           alert("Curso actualizado");
         } else {
           const { data: newCourse } = await supabase
             .from("courses")
             .insert(payload)
             .select()
             .single();
           await saveSectionsAndLessons(newCourse!.id);
           alert("Curso creado");
         }
       } finally {
         setLoading(false);
       }
     }
   
     /* --------- Render -------------------------------------------------- */
   
     return (
       <div className={styles.wrapper}>
         {/* Instructor popup */}
         {showInstructorPopup && (
           <InstructorPopup
             show={showInstructorPopup}
             instructor={editingInstructor}
             onClose={() => setShowInstructorPopup(false)}
             onSaved={(id) => {
               setShowInstructorPopup(false);
               setCourse((p) => ({ ...p, instructor_id: id }));
               fetchAllInstructors();
             }}
           />
         )}
   
         <button className={styles.backAdminBtn} onClick={() => router.push("/admin")}>
           Volver al Panel Admin
         </button>
         <h1 className={styles.pageTitle}>
           {isEditMode ? "Editar Curso" : "Crear Nuevo Curso"}
         </h1>
   
         {loading ? (
           <p>Cargando…</p>
         ) : (
           <form onSubmit={handleSubmit} className={styles.formArea}>
             {/* ---------- COMPONENTE: Información del Curso ---------------- */}
             <CourseBasicInfo
               course={course}
               instructors={instructors}
               onChange={handleBasicInfoChange}
               onShowInstructorPopup={handleShowInstructorPopup}
             />
   
             {/* ---------- CARD: Imagen, Descuento & Expiración ------------- */}
             <div className={styles.card}>
               {/* Subir Imagen */}
               <h2 className={styles.cardTitle}>Imagen & Descuento</h2>
               <div className={styles.fieldGroup}>
                 <label>Subir Imagen (750×500)</label>
                 <div className={styles.fileUploadWrapper}>
                   <input
                     id="file-upload"
                     type="file"
                     accept="image/*"
                     className={styles.hiddenFileInput}
                     onChange={handleFileChange}
                   />
                   <label htmlFor="file-upload" className={styles.fileUploadButton}>
                     Seleccionar Archivo
                   </label>
                 </div>
                 <button
                   type="button"
                   disabled={!selectedFile}
                   className={styles.uploadBtn}
                   onClick={handleUploadImage}
                 >
                   Subir Imagen
                 </button>
                 {selectedFile && (
                   <div className={styles.previewContainer}>
                     <img
                       src={URL.createObjectURL(selectedFile)}
                       alt="preview"
                       className={styles.previewImage}
                     />
                     <p>{selectedFile.name}</p>
                   </div>
                 )}
               </div>
   
               {/* Descuento */}
               <div className={styles.fieldRow}>
                 <div className={styles.fieldCol}>
                   <label>% Descuento</label>
                   <input
                     type="number"
                     name="discount_percentage"
                     min={0}
                     max={100}
                     value={course.discount_percentage}
                     onChange={handleCourseChange}
                   />
                 </div>
                 <div className={styles.fieldCol} style={{ alignItems: "center" }}>
                   <label>Descuento activo</label>
                   <input
                     type="checkbox"
                     name="discount_active"
                     checked={course.discount_active}
                     onChange={handleCourseChange}
                     style={{ width: 22, height: 22, marginTop: 4 }}
                   />
                 </div>
               </div>
   
               {/* Expiración */}
               <div className={styles.fieldGroup}>
                 <label>Vence (fecha y hora)</label>
                 <input
                   type="datetime-local"
                   name="expires_at"
                   value={course.expires_at || ""}
                   onChange={handleCourseChange}
                 />
                 <small style={{ color: "#666" }}>
                   Dejar vacío si no quieres un temporizador.
                 </small>
               </div>
             </div>
   
             {/* ---------- RESTO DE CARDS (sin cambios) --------------------- */}
             {/* Lo que aprenderás, Requisitos, Descripción Larga, Este curso incluye,
                 Secciones & Lecciones, Submit */}
             {/* ----- La implementación es la misma que el original y se mantiene aquí ----- */}
             {/* ... (todo el código de las cards restantes permanece idéntico) ... */}
   
             {/* ---------- CARD: Lo que aprenderás -------------------------- */}
             <div className={styles.card}>
               <h2 className={styles.cardTitle}>Lo que aprenderás</h2>
               {learningPoints.map((p, idx) => (
                 <div key={idx} className={styles.learningRow}>
                   <label>Punto {idx + 1}</label>
                   <input
                     type="text"
                     value={p}
                     onChange={(e) => handleLearningChange(idx, e.target.value)}
                   />
                   <button
                     type="button"
                     className={styles.removeBtn}
                     onClick={() => removeLearningPoint(idx)}
                   >
                     Eliminar
                   </button>
                 </div>
               ))}
               <button type="button" onClick={addLearningPoint} className={styles.addLessonBtn}>
                 + Agregar Punto
               </button>
             </div>
   
             {/* ---------- CARD: Requisitos --------------------------------- */}
             <div className={styles.card}>
               <h2 className={styles.cardTitle}>Requisitos</h2>
               {requirementsPoints.map((r, idx) => (
                 <div key={idx} className={styles.learningRow}>
                   <label>Requisito {idx + 1}</label>
                   <input
                     type="text"
                     value={r}
                     onChange={(e) => handleReqChange(idx, e.target.value)}
                   />
                   <button
                     type="button"
                     className={styles.removeBtn}
                     onClick={() => removeReqPoint(idx)}
                   >
                     Eliminar
                   </button>
                 </div>
               ))}
               <button type="button" onClick={addReqPoint} className={styles.addLessonBtn}>
                 + Agregar Requisito
               </button>
             </div>
   
             {/* ---------- CARD: Descripción Larga ------------------------- */}
             <div className={styles.card}>
               <h2 className={styles.cardTitle}>Descripción Larga</h2>
               {descParas.map((d, idx) => (
                 <div key={idx} className={styles.learningRow}>
                   <label>Párrafo {idx + 1}</label>
                   <textarea
                     rows={3}
                     value={d}
                     onChange={(e) => handleDescChange(idx, e.target.value)}
                   />
                   <button
                     type="button"
                     className={styles.removeBtn}
                     onClick={() => removeDescPara(idx)}
                   >
                     Eliminar
                   </button>
                 </div>
               ))}
               <button type="button" onClick={addDescPara} className={styles.addLessonBtn}>
                 + Agregar Párrafo
               </button>
             </div>
   
             {/* ---------- CARD: Este curso incluye ------------------------ */}
             <div className={styles.card}>
               <h2 className={styles.cardTitle}>"Este curso incluye"</h2>
               {!features.length && <p>No hay características añadidas.</p>}
               {features.map((f, idx) => (
                 <div key={idx} className={styles.featureRow}>
                   <div className={styles.featureCol}>
                     <label>Ícono</label>
                     <select
                       value={f.iconUrl}
                       onChange={(e) => handleFeatureChange(idx, "iconUrl", e.target.value)}
                     >
                       <option value="">-- Seleccionar ícono --</option>
                       {PREDEFINED_FEATURE_ICONS.map((icon) => (
                         <option key={icon.url} value={icon.url}>
                           {icon.label}
                         </option>
                       ))}
                     </select>
                     {f.iconUrl && (
                       <img src={f.iconUrl} alt="icon" style={{ width: 30, marginTop: 6 }} />
                     )}
                   </div>
                   <div className={styles.featureCol}>
                     <label>Texto</label>
                     <input
                       type="text"
                       value={f.text}
                       onChange={(e) => handleFeatureChange(idx, "text", e.target.value)}
                     />
                   </div>
                   <button
                     type="button"
                     className={styles.removeBtn}
                     onClick={() => removeFeature(idx)}
                   >
                     Eliminar
                   </button>
                 </div>
               ))}
               <button type="button" onClick={addFeature} className={styles.addLessonBtn}>
                 + Agregar Característica
               </button>
             </div>
   
             {/* ---------- CARD: Secciones & Lecciones --------------------- */}
             <div className={styles.card}>
               <h2 className={styles.cardTitle}>Secciones & Lecciones</h2>
               {sections.map((sec, secIdx) => (
                 <div key={secIdx} className={styles.sectionCard}>
                   {/* ... (idéntico al original) ... */}
                   {/* header sección */}
                   <div className={styles.sectionHeader}>
                     <div>
                       <label>Título</label>
                       <input
                         type="text"
                         value={sec.title}
                         onChange={(e) => handleSectionChange(secIdx, "title", e.target.value)}
                       />
                     </div>
                     <div>
                       <label>Orden</label>
                       <input
                         type="number"
                         value={sec.order_index}
                         onChange={(e) =>
                           handleSectionChange(secIdx, "order_index", parseInt(e.target.value) || 0)
                         }
                         style={{ width: 80 }}
                       />
                     </div>
                     <button
                       type="button"
                       className={styles.removeBtn}
                       onClick={() => removeSection(secIdx)}
                     >
                       Eliminar Sección
                     </button>
                   </div>
   
                   {/* lecciones */}
                   <div className={styles.lessonsWrapper}>
                     {sec.lessons.map((les, lesIdx) => (
                       <div key={lesIdx} className={styles.lessonCard}>
                         <div className={styles.lessonGrid}>
                           <div>
                             <label>Título</label>
                             <input
                               type="text"
                               value={les.title}
                               onChange={(e) =>
                                 handleLessonChange(secIdx, lesIdx, "title", e.target.value)
                               }
                             />
                           </div>
                           <div>
                             <label>Orden</label>
                             <input
                               type="number"
                               value={les.order_index}
                               onChange={(e) =>
                                 handleLessonChange(
                                   secIdx,
                                   lesIdx,
                                   "order_index",
                                   parseInt(e.target.value) || 0
                                 )
                               }
                             />
                           </div>
                         </div>
                         <div className={styles.lessonGrid}>
                           <div>
                             <label>Enlace de YouTube</label>
                             <input
                               type="text"
                               value={les.youtube_link}
                               onChange={(e) =>
                                 handleLessonChange(secIdx, lesIdx, "youtube_link", e.target.value)
                               }
                             />
                           </div>
                           <div>
                             <label>Duración (min:seg)</label>
                             <div className={styles.durationRow}>
                               <input
                                 type="number"
                                 value={les.minutes}
                                 onChange={(e) =>
                                   handleLessonChange(
                                     secIdx,
                                     lesIdx,
                                     "minutes",
                                     parseInt(e.target.value) || 0
                                   )
                                 }
                                 style={{ width: 60 }}
                               />
                               <span>:</span>
                               <input
                                 type="number"
                                 value={les.seconds}
                                 onChange={(e) =>
                                   handleLessonChange(
                                     secIdx,
                                     lesIdx,
                                     "seconds",
                                     parseInt(e.target.value) || 0
                                   )
                                 }
                                 style={{ width: 60 }}
                               />
                             </div>
                           </div>
                         </div>
                         <div className={styles.checkRow}>
                           <label>
                             <input
                               type="checkbox"
                               checked={les.paid}
                               onChange={(e) =>
                                 handleLessonChange(secIdx, lesIdx, "paid", e.target.checked)
                               }
                             />{" "}
                             ¿Lección de pago?
                           </label>
                         </div>
                         <button
                           type="button"
                           className={styles.removeBtn}
                           onClick={() => removeLesson(secIdx, lesIdx)}
                         >
                           Eliminar Lección
                         </button>
                       </div>
                     ))}
                     <button
                       type="button"
                       onClick={() => addLesson(secIdx)}
                       className={styles.addLessonBtn}
                     >
                       + Agregar Lección
                     </button>
                   </div>
                 </div>
               ))}
               <button type="button" onClick={addSection} className={styles.addSectionBtn}>
                 + Agregar Sección
               </button>
             </div>
   
             {/* ---------- Submit ------------------------------------------ */}
             <div className={styles.submitRow}>
               <button className={styles.saveBtn} disabled={loading}>
                 {isEditMode ? "Guardar Cambios" : "Crear Curso"}
               </button>
             </div>
           </form>
         )}
       </div>
     );
   }
   