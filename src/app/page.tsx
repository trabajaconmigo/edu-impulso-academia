import HeroSection from "./homepage/components/HeroSection";
import FeaturedCourses from "./homepage/components/FeaturedCourses";
import PlatformHighlights from "./homepage/components/PlatformHighlights";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <FeaturedCourses />
      <PlatformHighlights />
    </main>
  );
}
