// --------------------------------------------------------------------
// src/app/admin/layout.tsx
// Layout SERVER for /admin – noindex/nofollow + client-side guard
// --------------------------------------------------------------------

// 1) SEO → noindex, nofollow
export const metadata = {
    robots: {
      index: false,
      follow: false,
    },
  };
  
  import React from "react";
  import ClientOnly from "../components/ClientOnly";
  import AdminGuard from "./AdminGuard";
  
  export default function AdminLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    // Render our client-only guard around the actual admin UI
    return (
      <ClientOnly>
        <AdminGuard>{children}</AdminGuard>
      </ClientOnly>
    );
  }
  