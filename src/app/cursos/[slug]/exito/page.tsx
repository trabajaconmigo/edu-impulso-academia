// app/cursos/[slug]/exito/page.tsx

import ExitoClient from "./ExitoClient";

type PageProps = {
  params: {
    slug: string;
  };
};

// Minimal server component that passes "params.slug" to the client component
export default function ExitoPage({ params }: PageProps) {
  return <ExitoClient slug={params.slug} />;
}
