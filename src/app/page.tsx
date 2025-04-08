// src/app/page.tsx
import HeroSection from "./homepage/components/HeroSection";
import FeaturedCourses from "./homepage/components/FeaturedCourses"; // your existing featured courses component

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <FeaturedCourses />
    </main>
  );
}
