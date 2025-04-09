// src/app/admin/AddOrEditCourse.tsx
"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { COURSE_CATEGORIES } from "@/app/components/courseCategories";
import styles from "./AddOrEditCourse.module.css";

/** Types/interfaces (adjust as needed) */
interface LessonInput {
  id?: number;
  title: string;
  youtube_link: string;
  duration: number;
  paid: boolean;
  order_index: number;
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
  category?: string; // from courseCategories
  author_id?: string | null; // set from the logged user
  course_includes?: string;
  // ... any other fields you need
}

/**
 * If this page is used for both adding and editing,
 * parse e.g. `/admin/AddOrEditCourse?courseId=<UUID>` from the URL
 * and if present, fetch existing data and fill the form.
 */
export default function AddOrEditCoursePage() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [course, setCourse] = useState<CourseData>({
    slug: "",
    title: "",
    description: "",
    thumbnail_url: "",
    price: 0,
    category: "otros",
  });
  const [sections, setSections] = useState<SectionInput[]>([]);
  const [loading, setLoading] = useState(false);

  // 1) On mount, check if there's a courseId in query params
  //    and fetch the course if so
  useEffect(() => {
    // Example approach: parse window.location.search for ?courseId=...
    // If using next/navigation, you can use searchParams or router.
    const urlParams = new URLSearchParams(window.location.search);
    const cId = urlParams.get("courseId");
    if (cId) {
      setCourseId(cId);
      setIsEditMode(true);
      fetchExistingCourse(cId);
    } else {
      fetchAuthorId(); // for new course, we only fetch the user to set author_id
    }
  }, []);

  // 2) Fetch existing course data + sections/lessons
  async function fetchExistingCourse(id: string) {
    setLoading(true);
    try {
      // Fetch the course
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single();

      if (courseError || !courseData) {
        console.error("Error fetching course:", courseError);
        setLoading(false);
        return;
      }
      // Fill the course state
      setCourse(courseData);

      // Fetch sections & lectures for this course
      const { data: contentData, error: contentError } = await supabase
        .from("course_contents")
        .select("*")
        .eq("course_id", id)
        .order("order_index", { ascending: true });

      if (contentError) {
        console.error("Error fetching course contents:", contentError);
        setLoading(false);
        return;
      }

      // Convert that data into a sections[] with lessons[] structure
      const rawSections = (contentData || []).filter(
        (item: any) => item.type === "section"
      );
      const rawLectures = (contentData || []).filter(
        (item: any) => item.type === "lecture"
      );

      // Build up an array of sections with embedded lessons
      const builtSections = rawSections.map((sec: any) => {
        const theseLectures = rawLectures.filter(
          (lec: any) => lec.parent_section_id === sec.id
        );
        // Map them to our LessonInput interface
        const mappedLessons = theseLectures.map((lec: any) => ({
          id: lec.id,
          title: lec.title,
          youtube_link: lec.youtube_link || "",
          duration: lec.duration || 0,
          paid: lec.paid || false,
          order_index: lec.order_index,
        }));
        return {
          id: sec.id,
          title: sec.title,
          order_index: sec.order_index,
          lessons: mappedLessons,
        };
      });
      setSections(builtSections);
    } finally {
      setLoading(false);
    }
  }

  // 3) For a new course, fetch the current user (for author_id)
  async function fetchAuthorId() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setCourse((prev) => ({ ...prev, author_id: user.id }));
    }
  }

  // 4) Handlers for Course Form
  function handleCourseChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setCourse((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // 5) Handlers for Section + Lesson
  function addSection() {
    const newSec = {
      title: "",
      order_index: sections.length + 1,
      lessons: [] as LessonInput[],
    };
    setSections([...sections, newSec]);
  }
  function removeSection(index: number) {
    const updated = [...sections];
    updated.splice(index, 1);
    setSections(updated);
  }
  function handleSectionChange(
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const updated = [...sections];
    updated[index] = {
      ...updated[index],
      [e.target.name]: e.target.value,
    };
    setSections(updated);
  }
  function addLesson(sectionIndex: number) {
    const updated = [...sections];
    const newLesson: LessonInput = {
      title: "",
      youtube_link: "",
      duration: 0,
      paid: false,
      order_index: updated[sectionIndex].lessons.length + 1,
    };
    updated[sectionIndex].lessons.push(newLesson);
    setSections(updated);
  }
  function removeLesson(sectionIndex: number, lessonIndex: number) {
    const updated = [...sections];
    updated[sectionIndex].lessons.splice(lessonIndex, 1);
    setSections(updated);
  }
  function handleLessonChange(
    sectionIndex: number,
    lessonIndex: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const updated = [...sections];
    const { name, value, type, checked } = e.target;
    updated[sectionIndex].lessons[lessonIndex] = {
      ...updated[sectionIndex].lessons[lessonIndex],
      [name]: type === "checkbox" ? checked : value,
    };
    setSections(updated);
  }

  // 6) Submit Handler
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditMode && course.id) {
        // Update existing course
        const { error: updateError } = await supabase
          .from("courses")
          .update(course)
          .eq("id", course.id);

        if (updateError) {
          alert("Error actualizando el curso: " + updateError.message);
          setLoading(false);
          return;
        }

        // Insert/update sections & lectures
        await saveSectionsAndLessons(course.id);
        alert("Curso actualizado exitosamente");
      } else {
        // Insert new course
        const { data: createdCourse, error: insertError } = await supabase
          .from("courses")
          .insert(course)
          .select()
          .single();

        if (insertError || !createdCourse) {
          alert("Error creando el curso: " + insertError?.message);
          setLoading(false);
          return;
        }
        // Insert sections & lessons for the new course
        await saveSectionsAndLessons(createdCourse.id);
        alert("Curso creado exitosamente");
      }
    } finally {
      setLoading(false);
    }
  }

  // Helper to upsert sections & lessons
  async function saveSectionsAndLessons(course_id: string) {
    // We'll do a naive approach: insert or update each section and lesson individually.
    // In production, you might handle deletes or more advanced logic.

    for (const [secIndex, sec] of sections.entries()) {
      let sectionId = sec.id;
      // Upsert section
      if (!sec.id) {
        // Insert
        const { data: secData, error: secErr } = await supabase
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
        if (secErr || !secData) {
          console.error("Error inserting section:", secErr);
          continue;
        }
        sectionId = secData.id;
      } else {
        // Update
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

      // Now upsert lessons
      if (!sectionId) continue; // skip if section didn't save
      for (const [lesIndex, les] of sec.lessons.entries()) {
        if (!les.id) {
          // Insert
          const { error: lesErr } = await supabase.from("course_contents").insert({
            course_id,
            type: "lecture",
            title: les.title,
            youtube_link: les.youtube_link,
            duration: Number(les.duration),
            order_index: les.order_index,
            parent_section_id: sectionId,
            paid: les.paid,
          });
          if (lesErr) {
            console.error("Error inserting lesson:", lesErr);
          }
        } else {
          // Update
          const { error: lesUpdErr } = await supabase
            .from("course_contents")
            .update({
              title: les.title,
              youtube_link: les.youtube_link,
              duration: Number(les.duration),
              order_index: les.order_index,
              paid: les.paid,
            })
            .eq("id", les.id);
          if (lesUpdErr) {
            console.error("Error updating lesson:", lesUpdErr);
          }
        }
      }
    }
  }

  return (
    <>
      <Navbar />
      <div className={styles.wrapper}>
        <h1 className={styles.pageTitle}>
          {isEditMode ? "Editar Curso" : "Crear Nuevo Curso"}
        </h1>

        {loading ? (
          <p>Cargando...</p>
        ) : (
          <form onSubmit={handleSubmit} className={styles.formArea}>
            {/* Course Info Card */}
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
                  placeholder="ej: marketing-digital"
                  required
                />
              </div>

              <div className={styles.fieldGroup}>
                <label>Descripción</label>
                <textarea
                  name="description"
                  value={course.description}
                  onChange={handleCourseChange}
                  rows={4}
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
                    placeholder="ej: Español"
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

              <div className={styles.fieldGroup}>
                <label>Lo que aprenderás (texto largo)</label>
                <textarea
                  name="what_you_ll_learn"
                  value={course.what_you_ll_learn || ""}
                  onChange={handleCourseChange}
                  rows={5}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label>HTML "Este curso incluye"</label>
                <textarea
                  name="course_includes"
                  value={course.course_includes || ""}
                  onChange={handleCourseChange}
                  rows={4}
                />
              </div>
            </div>

            {/* Sections & Lessons Card */}
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
                        required
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

                  {/* Lessons within this section */}
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
                              onChange={(e) =>
                                handleLessonChange(secIndex, lesIndex, e)
                              }
                              required
                            />
                          </div>
                          <div>
                            <label>Orden</label>
                            <input
                              type="number"
                              name="order_index"
                              value={lesson.order_index}
                              onChange={(e) =>
                                handleLessonChange(secIndex, lesIndex, e)
                              }
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
                              onChange={(e) =>
                                handleLessonChange(secIndex, lesIndex, e)
                              }
                            />
                          </div>
                          <div>
                            <label>Duración (segundos)</label>
                            <input
                              type="number"
                              name="duration"
                              value={lesson.duration}
                              onChange={(e) =>
                                handleLessonChange(secIndex, lesIndex, e)
                              }
                            />
                          </div>
                        </div>

                        <div className={styles.checkRow}>
                          <label>
                            <input
                              type="checkbox"
                              name="paid"
                              checked={lesson.paid}
                              onChange={(e) =>
                                handleLessonChange(secIndex, lesIndex, e)
                              }
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
              <button type="button" onClick={addSection} className={styles.addSectionBtn}>
                + Agregar Sección
              </button>
            </div>

            {/* Submit Buttons */}
            <div className={styles.submitRow}>
              <button className={styles.saveBtn} disabled={loading}>
                {isEditMode ? "Guardar Cambios" : "Crear Curso"}
              </button>
            </div>
          </form>
        )}
      </div>
      <Footer />
    </>
  );
}
