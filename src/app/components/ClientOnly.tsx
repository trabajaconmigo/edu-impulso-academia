"use client";

import React, { useEffect, useState, PropsWithChildren } from "react";

/**
 * Ensures its children only render on the client.
 * Useful for wrapping client-side-only components inside server layouts.
 */
export default function ClientOnly({ children }: PropsWithChildren) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return <>{children}</>;
}
