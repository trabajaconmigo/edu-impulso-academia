/* --------------------------------------------------------------------
   app/mini_cursos/page.tsx  – LISTADO DE MINI-CURSOS (SERVER WRAPPER)
-------------------------------------------------------------------- */
import MiniCoursesListingPage from "./MiniCoursesListingPage";

export const metadata = {
  title: "Mini-Cursos Gratis | Escuela360",
  description: "Colección de mini-cursos gratuitos para impulsar tu marketing.",
};

export default function Page() {
  return <MiniCoursesListingPage />;
}
