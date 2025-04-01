import React from "react";
import ExitoClient from "./ExitoClient";

// A minimal server component: simply pass `params.slug` to the client component.
// We do NOT mark this function async, and we do NOT use any hooks here.
export default function ExitoPage({ params }: any) {
  // If you want to strongly type it:
  // export default function ExitoPage({ params }: { params: { slug: string } }) {
  // but "any" is guaranteed to compile, so let's keep it minimal.

  return <ExitoClient slug={params.slug} />;
}
