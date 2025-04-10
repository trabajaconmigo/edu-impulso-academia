"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import styles from "./ProfilePage.module.css";
import EditProfilePopup from "./EditProfilePopup";
import { FaEdit } from "react-icons/fa";

interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail_url: string;
  promo_video_url?: string;
  price: number;
}

interface Purchase {
  id: string;
  user_id: string;
  course_id: string;
  purchased_at: string;
  course: Course;
}

interface Profile {
  full_name: string;
  phone_number: string;
  profile_img: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [coursesPurchased, setCoursesPurchased] = useState<Course[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      // Check if user is logged in
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.push("/auth/login");
        return;
      }
      const userId = sessionData.session.user.id;

      // Fetch profile info
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, phone_number, profile_img")
        .eq("user_id", userId)
        .single();
      if (!profileError && profileData) {
        setProfile(profileData);
      }

      // Fetch purchased courses (with joined course data)
      const { data: purchaseData, error: purchaseError } = await supabase
        .from("purchases")
        .select("*, course:course_id(*)")
        .eq("user_id", userId);
      if (!purchaseError && purchaseData) {
        const purchases = purchaseData as Purchase[];
        const courses = purchases.map((item) => item.course);
        setCoursesPurchased(courses);
      }

      // Fetch recommended courses (example: latest 6 courses)
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("id, title, description, thumbnail_url, slug, price")
        .limit(6);
      if (!coursesError && coursesData) {
        setRecommendedCourses(coursesData as Course[]);
      }

      setLoading(false);
    }
    fetchData();
  }, [router]);

  if (loading) {
    return <div className={styles.loading}>Cargando...</div>;
  }

  return (
    <div className={styles.container}>
      {/* Left Column: User Info + Purchased Courses */}
      <div className={styles.leftColumn}>
        <div className={styles.profileHeader}>
          <img
            src={profile?.profile_img || "/favicon.ico"}
            alt="Foto de perfil"
            className={styles.profileImageLarge}
          />
          <div className={styles.profileInfo}>
            <h1 className={styles.profileName}>
              {profile?.full_name}
              <button
                className={styles.editIconBtn}
                onClick={() => setShowEditPopup(true)}
                title="Editar Perfil"
                aria-label="Editar Perfil"
              >
                <FaEdit />
              </button>
            </h1>
            <p className={styles.profilePhone}>
              {profile?.phone_number || "Sin número registrado"}
            </p>
          </div>
        </div>

        <h2 className={styles.galleryTitle}>Cursos Comprados</h2>
        {coursesPurchased.length === 0 ? (
          <p className={styles.noCourses}>No has comprado ningún curso.</p>
        ) : (
          <div className={styles.grid}>
            {coursesPurchased.map((course) => (
              <Link href={`/cursos/${course.slug}`} key={course.id} className={styles.cardLink}>
                <div className={styles.card}>
                  <div className={styles.cardImageWrapper}>
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className={styles.cardImage}
                    />
                  </div>
                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>{course.title}</h3>
                    <p className={styles.cardDesc}>{course.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Right Column: Comercial Side (Recommended Courses) */}
      <div className={styles.rightColumn}>
        <h2 className={styles.commercialTitle}>Cursos Recomendados</h2>
        {recommendedCourses.length === 0 ? (
          <p className={styles.noCourses}>No hay cursos recomendados.</p>
        ) : (
          <div className={styles.compactGrid}>
            {recommendedCourses.slice(0, 3).map((course) => (
              <Link href={`/cursos/${course.slug}`} key={course.id} className={styles.cardLink}>
                <div className={styles.compactCard}>
                  <div className={styles.cardImageWrapper}>
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className={styles.cardImage}
                    />
                  </div>
                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>{course.title}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {showEditPopup && profile && (
        <EditProfilePopup
          onClose={() => setShowEditPopup(false)}
          initialPhone={profile.phone_number}
          initialImage={profile.profile_img || "/favicon.ico"}
        />
      )}
    </div>
  );
}
