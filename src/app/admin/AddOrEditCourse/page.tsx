"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { COURSE_CATEGORIES } from "@/app/components/courseCategories";
import InstructorPopup from "./InstructorPopup"; // NEW: separate TSX file for the popup
import styles from "./styles/AddOrEditCourse.module.css";

/** "Este curso incluye" icons */
const PREDEFINED_FEATURE_ICONS = [
  { label: "Ícono de Video", url: "https://rvinrzxeetertylulqkx.supabase.co/storage/v1/object/public/courseimg//video_icon.png" },
  { label: "Ícono de Descargas", url: "https://rvinrzxeetertylulqkx.supabase.co/storage/v1/object/public/courseimg//download.png" },
  { label: "Ícono de Tareas", url: "https://rvinrzxeetertylulqkx.supabase.co/storage/v1/object/public/courseimg//certificate-icon.png" },
  { label: "Ícono de Dispositivos", url: "https://rvinrzxeetertylulqkx.supabase.co/storage/v1/object/public/courseimg//devices-icon.png" },
  { label: "Ícono de Foros", url: "https://rvinrzxeetertylulqkx.supabase.co/storage/v1/object/public/courseimg//foros.png" },
  { label: "Ícono de Certificado", url: "https://rvinrzxeetertylulqkx.supabase.co/storage/v1/object/public/courseimg//certificate.png" },
];

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
  id?: string;
  slug: string;
  title: string;
  description: string;
  subtitle?: string;
  thumbnail_url: string;
  what_you_ll_learn?: string;
  price: number;
  language?: string;
  category?: string;
  author_id?: string | null;
  course_includes?: string;

  // NEW columns
  requirements?: string | null;
  description_long?: string | null;
  instructor_id?: string | null;
}

interface InstructorRow {
  id: string;
  user_id: string;
  full_name: string;
  // other columns...
}

export default function AddOrEditCoursePage() {
  const router = useRouter();
  const [isEditMode, setIsEditMode] = useState(false);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [course, setCourse] = useState<CourseData>({
    slug: "",
    title: "",
    description: "",
    thumbnail_url: "",
    price: 0,
    category: "otros",
  });

  // For image upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // "Este curso incluye" features
  const [features, setFeatures] = useState<FeatureItem[]>([]);

  // Sections & lessons
  const [sections, setSections] = useState<SectionInput[]>([]);

  // "Lo que aprenderás" bullet points
  const [learningPoints, setLearningPoints] = useState<string[]>([]);

  // NEW: Requirements => bullet points
  const [requirementsPoints, setRequirementsPoints] = useState<string[]>([]);

  // NEW: Description => multi paragraphs
  const [descParas, setDescParas] = useState<string[]>([]);

  // NEW: Instructors
  const [instructors, setInstructors] = useState<InstructorRow[]>([]);
  const [showInstructorPopup, setShowInstructorPopup] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<InstructorRow | null>(null);

  // On mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cId = params.get("courseId");
    if (cId) {
      setIsEditMode(true);
      setCourseId(cId);
      fetchExistingCourse(cId);
    } else {
      fetchAuthorId();
    }
    fetchAllInstructors(); // Offer a dropdown of all instructors
  }, []);

  async function fetchAllInstructors() {
    // NEW: get all instructors in table "instructors"
    const { data, error } = await supabase.from("instructors").select("*");
    if (!error && data) {
      setInstructors(data);
    }
  }

  async function fetchAuthorId() {
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user) {
      setCourse((prev) => ({ ...prev, author_id: userData.user.id }));
    }
  }

  async function fetchExistingCourse(id: string) {
    setLoading(true);
    try {
      const { data: cData, error: cErr } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single();
      if (cErr || !cData) {
        console.error("Error fetching course:", cErr);
        return;
      }
      setCourse(cData);

      // parse course_includes => features
      let parsedFeatures: FeatureItem[] = [];
      if (cData.course_includes) {
        parsedFeatures = parseFeaturesFromHTML(cData.course_includes);
      }
      setFeatures(parsedFeatures);

      // parse what_you_ll_learn => bullet points
      if (cData.what_you_ll_learn) {
        const points = cData.what_you_ll_learn.split(/\r?\n\r?\n|\r?\n/).filter((p) => p.trim());
        setLearningPoints(points);
      }

      // NEW: parse requirements => bullet points
      if (cData.requirements) {
        const reqLines = parseLiItemsFromHTML(cData.requirements);
        setRequirementsPoints(reqLines);
      }

      // NEW: parse description_long => paragraphs
      if (cData.description_long) {
        const paragraphs = parseParagraphsFromHTML(cData.description_long);
        setDescParas(paragraphs);
      }

      // fetch sections/lessons
      const { data: contentData, error: cntErr } = await supabase
        .from("course_contents")
        .select("*")
        .eq("course_id", id)
        .order("order_index", { ascending: true });
      if (!cntErr && contentData) {
        buildSectionsAndLessons(contentData);
      }
    } finally {
      setLoading(false);
    }
  }

  function parseFeaturesFromHTML(htmlString: string): FeatureItem[] {
    const feats: FeatureItem[] = [];
    const liMatches = htmlString.split("<li>").slice(1);
    liMatches.forEach((chunk) => {
      const liContent = chunk.split("</li>")[0].trim();
      const imgMatch = liContent.match(/<img\s+src="([^"]+)"/);
      const iconUrl = imgMatch ? imgMatch[1] : "";
      const text = liContent.replace(/<img[^>]+>/, "").trim();
      feats.push({ iconUrl, text });
    });
    return feats;
  }

  // NEW: parse <ul><li>line</li> => array of strings
  function parseLiItemsFromHTML(htmlStr: string): string[] {
    const liMatches = htmlStr.split("<li>").slice(1);
    return liMatches.map((chunk) => {
      return chunk.split("</li>")[0].replace(/<[^>]+>/g, "").trim();
    });
  }

  // NEW: parse paragraphs => array
  function parseParagraphsFromHTML(htmlStr: string): string[] {
    // naive approach => split by <p>
    const splitted = htmlStr.split("<p>").slice(1);
    return splitted.map((chunk) => chunk.split("</p>")[0].replace(/<[^>]+>/g, "").trim());
  }

  function buildSectionsAndLessons(rows: any[]) {
    const rawSections = rows.filter((it) => it.type === "section");
    const rawLectures = rows.filter((it) => it.type === "lecture");
    const built = rawSections.map((sec: any) => {
      const theseLectures = rawLectures.filter((lec: any) => lec.parent_section_id === sec.id);
      const mappedLessons = theseLectures.map((lec: any) => {
        const duration = lec.duration || 0;
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        return {
          id: lec.id,
          title: lec.title,
          youtube_link: lec.youtube_link || "",
          paid: lec.paid || false,
          order_index: lec.order_index,
          minutes,
          seconds,
        };
      });
      return {
        id: sec.id,
        title: sec.title,
        order_index: sec.order_index,
        lessons: mappedLessons,
      };
    });
    setSections(built);
  }

  // File upload
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  }
  async function handleUploadImage() {
    if (!selectedFile) return;
    setLoading(true);
    try {
      const resizedBlob = await resizeImageFile(selectedFile, 750, 500);
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("courseimg")
        .upload(fileName, resizedBlob, {
          cacheControl: "3600",
          upsert: false,
        });
      if (uploadError) {
        alert("Error subiendo imagen: " + uploadError.message);
        return;
      }
      const url = `https://rvinrzxeetertylulqkx.supabase.co/storage/v1/object/public/courseimg/${fileName}`;
      setCourse((prev) => ({ ...prev, thumbnail_url: url }));
      alert("Imagen subida y asignada correctamente");
    } finally {
      setLoading(false);
    }
  }
  async function resizeImageFile(file: File, width: number, height: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function(ev) {
        const img = new Image();
        img.onload = function() {
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas context is null"));
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Canvas is empty"));
                return;
              }
              resolve(blob);
            },
            "image/jpeg",
            0.8
          );
        };
        if (typeof ev.target?.result === "string") {
          img.src = ev.target.result;
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  // Changes to course fields
  function handleCourseChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setCourse((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // "Lo que aprenderás"
  function addLearningPoint() {
    setLearningPoints((prev) => [...prev, ""]);
  }
  function removeLearningPoint(idx: number) {
    const updated = [...learningPoints];
    updated.splice(idx, 1);
    setLearningPoints(updated);
  }
  function handleLearningPointChange(idx: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const updated = [...learningPoints];
    updated[idx] = e.target.value;
    setLearningPoints(updated);
  }
  function buildLearningPointsString(points: string[]): string {
    return points.join("\n\n");
  }

  // Requirements => bullet points
  function addRequirementPoint() {
    setRequirementsPoints((prev) => [...prev, ""]);
  }
  function removeRequirementPoint(idx: number) {
    const updated = [...requirementsPoints];
    updated.splice(idx, 1);
    setRequirementsPoints(updated);
  }
  function handleRequirementChange(idx: number, e: React.ChangeEvent<HTMLInputElement>) {
    const updated = [...requirementsPoints];
    updated[idx] = e.target.value;
    setRequirementsPoints(updated);
  }
  function buildRequirementsHTML(points: string[]): string {
    // <ul><li>point1</li><li>point2</li> ...
    if (!points.length) return "";
    let html = '<ul style="list-style-type: disc;">\n';
    points.forEach((p) => {
      html += `  <li>${p}</li>\n`;
    });
    html += "</ul>";
    return html;
  }

  // Description => multi paragraphs
  function addDescPara() {
    setDescParas((prev) => [...prev, ""]);
  }
  function removeDescPara(idx: number) {
    const updated = [...descParas];
    updated.splice(idx, 1);
    setDescParas(updated);
  }
  function handleDescParaChange(idx: number, e: React.ChangeEvent<HTMLTextAreaElement>) {
    const updated = [...descParas];
    updated[idx] = e.target.value;
    setDescParas(updated);
  }
  function buildDescriptionHTML(paras: string[]): string {
    // <p style="margin-top: 1rem;"> for subsequent paragraphs or simpler approach:
    if (!paras.length) return "";
    let html = "";
    paras.forEach((txt, i) => {
      if (i === 0) {
        html += `<p>${txt}</p>\n`;
      } else {
        // add top margin to subsequent paragraphs
        html += `<p style="margin-top:1rem;">${txt}</p>\n`;
      }
    });
    return html;
  }

  // "Este curso incluye"
  function addFeature() {
    setFeatures((prev) => [...prev, { iconUrl: "", text: "" }]);
  }
  function removeFeature(idx: number) {
    const updated = [...features];
    updated.splice(idx, 1);
    setFeatures(updated);
  }
  function handleFeatureChange(idx: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    const updated = [...features];
    (updated[idx] as any)[name] = value;
    setFeatures(updated);
  }
  function buildFeaturesHTML(items: FeatureItem[]): string {
    if (!items || !items.length) return "";
    let html = "<ul>\n";
    items.forEach((f) => {
      html += `  <li><img src="${f.iconUrl}" /> ${f.text}</li>\n`;
    });
    html += "</ul>";
    return html;
  }

  // Sections & lessons
  function addSection() {
    setSections((prev) => [
      ...prev,
      { title: "", order_index: prev.length + 1, lessons: [] },
    ]);
  }
  function removeSection(idx: number) {
    const updated = [...sections];
    updated.splice(idx, 1);
    setSections(updated);
  }
  function handleSectionChange(idx: number, e: React.ChangeEvent<HTMLInputElement>) {
    const updated = [...sections];
    updated[idx] = { ...updated[idx], [e.target.name]: e.target.value };
    setSections(updated);
  }
  function addLesson(secIdx: number) {
    const updated = [...sections];
    updated[secIdx].lessons.push({
      title: "",
      youtube_link: "",
      paid: false,
      order_index: updated[secIdx].lessons.length + 1,
      minutes: 0,
      seconds: 0,
    });
    setSections(updated);
  }
  function removeLesson(secIdx: number, lesIdx: number) {
    const updated = [...sections];
    updated[secIdx].lessons.splice(lesIdx, 1);
    setSections(updated);
  }
  function handleLessonChange(secIdx: number, lesIdx: number, e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, checked } = e.target;
    const updated = [...sections];
    const lesson = updated[secIdx].lessons[lesIdx];
    if (name === "paid") {
      lesson.paid = checked;
    } else if (name === "minutes") {
      lesson.minutes = parseInt(value) || 0;
    } else if (name === "seconds") {
      lesson.seconds = parseInt(value) || 0;
    } else {
      (lesson as any)[name] = value;
    }
    updated[secIdx].lessons[lesIdx] = lesson;
    setSections(updated);
  }
  async function saveSectionsAndLessons(course_id: string) {
    // same logic
    for (const sec of sections) {
      let sectionId = sec.id;
      if (!sec.id) {
        // insert
        const { data: newSec, error: secErr } = await supabase
          .from("course_contents")
          .insert({
            course_id,
            type: "section",
            title: sec.title,
            order_index: sec.order_index,
            parent_section_id: null,
            paid: false,
          })
          .select()
          .single();
        if (secErr || !newSec) {
          console.error("Error creating section:", secErr);
          continue;
        }
        sectionId = newSec.id;
      } else {
        // update
        const { error: secUpdErr } = await supabase
          .from("course_contents")
          .update({
            title: sec.title,
            order_index: sec.order_index,
          })
          .eq("id", sec.id);
        if (secUpdErr) {
          console.error("Error updating section:", secUpdErr);
          continue;
        }
      }
      // lessons
      for (const les of sec.lessons) {
        const totalSec = les.minutes * 60 + les.seconds;
        if (!les.id) {
          // insert
          const { error: insLesErr } = await supabase.from("course_contents").insert({
            course_id,
            type: "lecture",
            title: les.title,
            youtube_link: les.youtube_link,
            duration: totalSec,
            order_index: les.order_index,
            parent_section_id: sectionId,
            paid: les.paid,
          });
          if (insLesErr) {
            console.error("Error inserting lesson:", insLesErr);
          }
        } else {
          // update
          const { error: updLesErr } = await supabase
            .from("course_contents")
            .update({
              title: les.title,
              youtube_link: les.youtube_link,
              duration: totalSec,
              order_index: les.order_index,
              paid: les.paid,
            })
            .eq("id", les.id);
          if (updLesErr) {
            console.error("Error updating lesson:", updLesErr);
          }
        }
      }
    }
  }

  // Instructors
  function handleInstructorSelection(e: React.ChangeEvent<HTMLSelectElement>) {
    setCourse((prev) => ({ ...prev, instructor_id: e.target.value }));
  }
  function openCreateInstructorPopup() {
    setEditingInstructor(null);
    setShowInstructorPopup(true);
  }
  function openEditInstructorPopup() {
    if (!course.instructor_id) return;
    const found = instructors.find((inst) => inst.id === course.instructor_id);
    if (!found) return;
    setEditingInstructor(found);
    setShowInstructorPopup(true);
  }
  async function handleInstructorSaved(newId: string) {
    setShowInstructorPopup(false);
    await fetchAllInstructors();
    setCourse((prev) => ({ ...prev, instructor_id: newId }));
  }

  // Submit the entire course
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      // build HTML for "Este curso incluye"
      const course_includes = buildFeaturesHTML(features);

      // "Lo que aprenderás"
      const compiledLearning = buildLearningPointsString(learningPoints);

      // Requirements => bullet list
      const reqHTML = buildRequirementsHTML(requirementsPoints);

      // Description => multi paragraphs
      const descHTML = buildDescriptionHTML(descParas);

      const { ...fieldsToSave } = course;
      (fieldsToSave as any).course_includes = course_includes;
      (fieldsToSave as any).what_you_ll_learn = compiledLearning;
      (fieldsToSave as any).requirements = reqHTML;
      (fieldsToSave as any).description_long = descHTML;

      if (isEditMode && course.id) {
        // update
        const { error: updErr } = await supabase
          .from("courses")
          .update(fieldsToSave)
          .eq("id", course.id);
        if (updErr) {
          alert("Error actualizando el curso: " + updErr.message);
          return;
        }
        await saveSectionsAndLessons(course.id);
        alert("Curso actualizado exitosamente");
      } else {
        // create
        const { data: newCourse, error: insErr } = await supabase
          .from("courses")
          .insert(fieldsToSave)
          .select()
          .single();
        if (insErr || !newCourse) {
          alert("Error creando el curso: " + insErr?.message);
          return;
        }
        await saveSectionsAndLessons(newCourse.id);
        alert("Curso creado exitosamente");
      }
    } finally {
      setLoading(false);
    }
  }

  function goBackAdmin() {
    router.push("/admin");
  }

  return (
    <div className={styles.wrapper}>
      {showInstructorPopup && (
        <InstructorPopup
          show={showInstructorPopup}
          instructor={editingInstructor}
          onClose={() => setShowInstructorPopup(false)}
          onSaved={handleInstructorSaved}
        />
      )}

      <button onClick={goBackAdmin} className={styles.backAdminBtn}>
        Volver al Panel Admin
      </button>
      <h1 className={styles.pageTitle}>
        {isEditMode ? "Editar Curso" : "Crear Nuevo Curso"}
      </h1>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <form onSubmit={handleSubmit} className={styles.formArea}>
          {/* Course Info */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Información del Curso</h2>

            <div className={styles.fieldGroup}>
              <label>Título del Curso</label>
              <input
                type="text"
                name="title"
                value={course.title}
                onChange={handleCourseChange}
                required
              />
            </div>

            <div className={styles.fieldGroup}>
              <label>Slug</label>
              <input
                type="text"
                name="slug"
                value={course.slug}
                onChange={handleCourseChange}
                required
              />
            </div>

            <div className={styles.fieldGroup}>
              <label>Descripción Breve</label>
              <textarea
                name="description"
                rows={3}
                value={course.description}
                onChange={handleCourseChange}
                required
              />
            </div>

            <div className={styles.fieldGroup}>
              <label>Subtítulo</label>
              <input
                type="text"
                name="subtitle"
                value={course.subtitle || ""}
                onChange={handleCourseChange}
              />
            </div>

            {/* Instructor */}
            <div className={styles.fieldGroup}>
              <label>Instructor</label>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <select
                  name="instructor_id"
                  value={course.instructor_id || ""}
                  onChange={handleInstructorSelection}
                >
                  <option value="">-- Seleccionar un Instructor --</option>
                  {instructors.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.full_name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    if (course.instructor_id) {
                      openEditInstructorPopup();
                    } else {
                      openCreateInstructorPopup();
                    }
                  }}
                  style={{
                    border: "1px solid blue",
                    backgroundColor: "transparent",
                    color: "blue",
                    padding: "0.4rem 0.8rem",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  {course.instructor_id ? "Editar Instructor" : "Crear Instructor"}
                </button>
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label>Imagen (Thumbnail URL)</label>
              <input
                type="text"
                name="thumbnail_url"
                value={course.thumbnail_url}
                onChange={handleCourseChange}
                required
              />
            </div>

            {/* custom file upload */}
            <div className={styles.fieldGroup}>
              <label>Subir Imagen (750x500)</label>
              <div className={styles.fileUploadWrapper}>
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={styles.hiddenFileInput}
                />
                <label htmlFor="file-upload" className={styles.fileUploadButton}>
                  Seleccionar Archivo
                </label>
              </div>
              <button
                type="button"
                onClick={handleUploadImage}
                disabled={!selectedFile || loading}
                className={styles.uploadBtn}
              >
                Subir Imagen
              </button>
              {selectedFile && (
                <div className={styles.previewContainer}>
                  <p>Vista previa:</p>
                  <img
                    src={URL.createObjectURL(selectedFile)}
                    alt="Vista previa"
                    className={styles.previewImage}
                  />
                  <p>Archivo seleccionado: {selectedFile.name}</p>
                </div>
              )}
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.fieldCol}>
                <label>Precio (MXN)</label>
                <input
                  type="number"
                  name="price"
                  value={course.price}
                  onChange={handleCourseChange}
                  required
                />
              </div>
              <div className={styles.fieldCol}>
                <label>Idioma</label>
                <input
                  type="text"
                  name="language"
                  value={course.language || ""}
                  onChange={handleCourseChange}
                />
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label>Categoría</label>
              <select
                name="category"
                value={course.category || "otros"}
                onChange={handleCourseChange}
              >
                {COURSE_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* "Lo que aprenderás" */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Lo que aprenderás</h2>
            {learningPoints.map((point, idx) => (
              <div key={idx} className={styles.learningRow}>
                <label>Punto {idx + 1}</label>
                <input
                  type="text"
                  value={point}
                  onChange={(e) => handleLearningPointChange(idx, e)}
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
            <button
              type="button"
              onClick={addLearningPoint}
              className={styles.addLessonBtn}
            >
              + Agregar Punto
            </button>
          </div>

          {/* Requisitos => bullet points */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Requisitos</h2>
            {requirementsPoints.map((req, idx) => (
              <div key={idx} className={styles.learningRow}>
                <label>Requisito {idx + 1}</label>
                <input
                  type="text"
                  value={req}
                  onChange={(e) => handleRequirementChange(idx, e)}
                />
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => removeRequirementPoint(idx)}
                >
                  Eliminar
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addRequirementPoint}
              className={styles.addLessonBtn}
            >
              + Agregar Requisito
            </button>
          </div>

          {/* Descripción => multi paragraphs */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Descripción Larga</h2>
            {descParas.map((para, idx) => (
              <div key={idx} className={styles.learningRow}>
                <label>Párrafo {idx + 1}</label>
                <textarea
                  rows={3}
                  value={para}
                  onChange={(e) => handleDescParaChange(idx, e)}
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
            <button
              type="button"
              onClick={addDescPara}
              className={styles.addLessonBtn}
            >
              + Agregar Párrafo
            </button>
          </div>

          {/* "Este curso incluye" */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>"Este curso incluye" (Características)</h2>
            {features.length === 0 && <p>No hay características añadidas.</p>}
            {features.map((feat, idx) => (
              <div key={idx} className={styles.featureRow}>
                <div className={styles.featureCol}>
                  <label>Ícono</label>
                  <select
                    name="iconUrl"
                    value={feat.iconUrl}
                    onChange={(e) => handleFeatureChange(idx, e)}
                  >
                    <option value="">-- Seleccionar ícono --</option>
                    {PREDEFINED_FEATURE_ICONS.map((icon) => (
                      <option key={icon.url} value={icon.url}>
                        {icon.label}
                      </option>
                    ))}
                  </select>
                  {feat.iconUrl && (
                    <img
                      src={feat.iconUrl}
                      alt="Ícono"
                      style={{ width: "30px", marginTop: "5px" }}
                    />
                  )}
                </div>
                <div className={styles.featureCol}>
                  <label>Texto</label>
                  <input
                    type="text"
                    name="text"
                    value={feat.text}
                    onChange={(e) => handleFeatureChange(idx, e)}
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
            <button
              type="button"
              onClick={addFeature}
              className={styles.addLessonBtn}
            >
              + Agregar Característica
            </button>
          </div>

          {/* Secciones & Lecciones */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Secciones & Lecciones</h2>
            {sections.map((section, secIndex) => (
              <div key={secIndex} className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <div>
                    <label>Título de la sección</label>
                    <input
                      type="text"
                      name="title"
                      value={section.title}
                      onChange={(e) => handleSectionChange(secIndex, e)}
                    />
                  </div>
                  <div>
                    <label>Orden</label>
                    <input
                      type="number"
                      name="order_index"
                      value={section.order_index}
                      onChange={(e) => handleSectionChange(secIndex, e)}
                      style={{ width: "80px" }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSection(secIndex)}
                    className={styles.removeBtn}
                  >
                    Eliminar Sección
                  </button>
                </div>
                <div className={styles.lessonsWrapper}>
                  {section.lessons.map((lesson, lesIndex) => (
                    <div key={lesIndex} className={styles.lessonCard}>
                      <div className={styles.lessonGrid}>
                        <div>
                          <label>Título de la lección</label>
                          <input
                            type="text"
                            name="title"
                            value={lesson.title}
                            onChange={(e) => handleLessonChange(secIndex, lesIndex, e)}
                          />
                        </div>
                        <div>
                          <label>Orden</label>
                          <input
                            type="number"
                            name="order_index"
                            value={lesson.order_index}
                            onChange={(e) => handleLessonChange(secIndex, lesIndex, e)}
                          />
                        </div>
                      </div>
                      <div className={styles.lessonGrid}>
                        <div>
                          <label>Enlace de YouTube</label>
                          <input
                            type="text"
                            name="youtube_link"
                            value={lesson.youtube_link}
                            onChange={(e) => handleLessonChange(secIndex, lesIndex, e)}
                          />
                        </div>
                        <div>
                          <label>Duración (min:seg)</label>
                          <div className={styles.durationRow}>
                            <input
                              type="number"
                              name="minutes"
                              value={lesson.minutes}
                              onChange={(e) => handleLessonChange(secIndex, lesIndex, e)}
                              style={{ width: "60px" }}
                            />
                            <span>:</span>
                            <input
                              type="number"
                              name="seconds"
                              value={lesson.seconds}
                              onChange={(e) => handleLessonChange(secIndex, lesIndex, e)}
                              style={{ width: "60px" }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className={styles.checkRow}>
                        <label>
                          <input
                            type="checkbox"
                            name="paid"
                            checked={lesson.paid}
                            onChange={(e) => handleLessonChange(secIndex, lesIndex, e)}
                          />
                          &nbsp;¿Esta lección es de pago?
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLesson(secIndex, lesIndex)}
                        className={styles.removeBtn}
                      >
                        Eliminar Lección
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addLesson(secIndex)}
                    className={styles.addLessonBtn}
                  >
                    + Agregar Lección
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addSection}
              className={styles.addSectionBtn}
            >
              + Agregar Sección
            </button>
          </div>

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

// The instructor popup is now in a separate file "InstructorPopup.tsx"
// We do not define it here anymore.
