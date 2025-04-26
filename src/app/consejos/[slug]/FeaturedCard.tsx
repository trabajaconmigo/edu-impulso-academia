/* src/app/consejos/[slug]/FeaturedCard.tsx */
import Link  from 'next/link';
import styles from './FeaturedCard.module.css';

export default function FeaturedCard({course}:{course:any}) {
  return (
    <Link href={`/cursos/${course.slug}`} className={styles.card}>
      <img src={course.thumbnail_url} alt={course.title}/>
      <h4>{course.title}</h4>
    </Link>
  );
}
