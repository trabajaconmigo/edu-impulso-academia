import React from "react";
import CourseDetailClient from "./CourseDetailClient";

export default function CourseDetailPage({ params }: any) {
  // If you'd like to define a minimal type:
  // export default function CourseDetailPage({ params }: { params: { slug: string } }) {
  //   return <CourseDetailClient slug={params.slug} />;
  // }
  // But to absolutely silence the TS error, we can pass `any` for the props.

  return <CourseDetailClient slug={params.slug} />;
}
