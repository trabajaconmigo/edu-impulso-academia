// interfaces.ts

export interface Course {
  id: string;
  title: string;
  price: number;
  thumbnail_url: string;
  discount?: number;
  course_includes?: string;
}

export interface Lesson {
  preview_video: string;
}
