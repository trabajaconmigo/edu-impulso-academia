// src/app/admin/AddOrEditCourse/types.ts

export interface InstructorRow {
  id: string;
  user_id: string;
  full_name: string;
}

export interface CourseData {
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

  /* referral toggles (if you added them) */
  referral_enabled?: boolean;
  referral_half_price?: boolean;
}
