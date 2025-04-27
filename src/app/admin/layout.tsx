/* --------------------------------------------------------------------
   layout global para /admin – impide indexación por buscadores
-------------------------------------------------------------------- */
export const metadata = {
  robots: {
    index: false,   // noindex
    follow: false,  // nofollow
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  /* Podrías incluir aquí un wrapper <Navbar/> exclusivo de admin
     si lo necesitas; por ahora solo devolvemos children */
  return <>{children}</>;
}
