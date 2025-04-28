"use client";

import { PropsWithChildren, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import styles from "./AdminLayout.module.css";

export default function AdminGuard({ children }: PropsWithChildren) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const {
        data: { session },
        error: sesError,
      } = await supabase.auth.getSession();
      if (sesError || !session) {
        router.replace("/auth/login");
        return;
      }

      const { data: profile, error: profError } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      if (profError || profile?.role !== "admin") {
        router.replace("/");
        return;
      }

      setAuthorized(true);
    })();
  }, [router]);

  if (authorized === null) {
    return (
      <div className={styles.loadingContainer}>
        <p className={styles.loadingText}>Verificando permisos…</p>
      </div>
    );
  }

  return <>{children}</>;
}
