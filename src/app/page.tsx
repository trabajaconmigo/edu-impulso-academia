// app/page.tsx
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <section className={styles.homeContainer}>
      <div className={styles.hero}>
        <h1>Bienvenido a Edu Impulso Academia</h1>
        <p>La mejor plataforma de cursos en línea para expandir tus habilidades.</p>
        <button className={styles.exploreBtn}>Explorar Cursos</button>
      </div>

      <div className={styles.featured}>
        <h2>Cursos Destacados</h2>
        <div className={styles.cardGrid}>
          <div className={styles.card}>
            <h3>Marketing Digital</h3>
            <p>Aprende estrategias para redes sociales, SEO y más.</p>
          </div>
          <div className={styles.card}>
            <h3>Programación Web</h3>
            <p>HTML, CSS, JavaScript y frameworks populares.</p>
          </div>
          <div className={styles.card}>
            <h3>Diseño Gráfico</h3>
            <p>Herramientas clave para la creación visual profesional.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
