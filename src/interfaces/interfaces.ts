// interfaces.ts

interface Course {
  id: string;
  title: string;          // Make sure this is present
  description: string;    // And this
  subtitle?: string;      // If you need it
  thumbnail_url: string;
  slug: string;
  what_you_ll_learn: string;
  student_count: number;
  created_by: string;
  last_updated: string;
  language: string;
  price: number;
}


export interface Lesson {
  preview_video: string;
}
